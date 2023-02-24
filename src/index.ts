import { dynamodbHydrateOne } from "./connectors/dynamodb";
import { loadConfig } from "./yaml";
import { mssqlHydrateOne } from "./connectors/mssql";
import { ionHydrateOne } from "./connectors/ion";
import { customProgressBar } from "./utils";
import fs from "fs";

export interface CliParams {
  yml: string;
}

const actionMap = {
  ion: ionHydrateOne,
  dynamodb: dynamodbHydrateOne,
  mssql: mssqlHydrateOne,
};

/**
 * @param { object } params - The command line parameters
 */
export async function processEvents(params: CliParams) {
  let doc;

  try {
    // load and validate the config file
    doc = await loadConfig(params.yml);
  } catch (e) {
    console.error("YML file is invalid");
    throw e;
  }
  const progressBar = customProgressBar(doc);

  // load using fs instead
  const events = JSON.parse(fs.readFileSync(doc.source, "utf8"));

  // so that we can do something only on the first event
  let isFirstEvent = true;

  // create a progress bar
  progressBar.start(events.length, 0);

  // iterate the events in this set
  for (let event of events) {
    // update the progress bar
    progressBar.update(events.indexOf(event));

    // iterate the events in this file
    for (let event of events) {
      for (let pattern of doc.patterns) {
        // for each key and value in the pattern check for matching pattern in the event
        let matched = true;
        for (let [key, value] of Object.entries(pattern.rule)) {
          if (event[key] !== value) {
            matched = false;
          }
        }
        if (matched) {
          // if pattern.action.target does not exist in the actionMap, throw an error
          if (!actionMap[pattern.action?.target]) {
            throw new Error(
              `Action target ${pattern.action.target} is not supported`
            );
          }
          actionMap[pattern.action.target](pattern, event, isFirstEvent);
        }
      }
    }
    isFirstEvent = false;
  }
  progressBar.update(events.length);
  progressBar.stop();
}
