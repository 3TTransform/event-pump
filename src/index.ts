import { dynamodbHydrateOne } from "./connectors/dynamodb";
import { loadConfig } from "./yaml";
import { mssqlHydrateOne } from "./connectors/mssql";
import { ionHydrateOne } from "./connectors/ion";
import { customProgressBar } from "./utils";
import fs from "fs";

export interface CliParams {
  yml: string;
}

/**
 * @param { object } params - The command line parameters
 */
export async function processEvents(params: CliParams) {
  let doc;

  try {
    // load and validate the config file
    doc = await loadConfig(params.yml);
  } catch (e) {
    console.log("YML file is invalid");
    console.log(e.errors);
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

    for (let pattern of doc.patterns) {
      // for each key and value in the pattern check for matching pattern in the event
      let matched = true;
      for (let [key, value] of Object.entries(pattern.rule)) {
        if (event[key] !== value) {
          matched = false;
        }
      }
    }

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
        if (pattern.action.target === "ion") {
          ionHydrateOne(pattern, event, isFirstEvent);
        }
        if (pattern.action.target === "dynamodb") {
          dynamodbHydrateOne(pattern, event, isFirstEvent);
        }
        if (pattern.action.target === "mssql") {
          mssqlHydrateOne(pattern, event, isFirstEvent);
        }
      }
    }
    isFirstEvent = false;
  }
  progressBar.update(events.length);
  progressBar.stop();
}
