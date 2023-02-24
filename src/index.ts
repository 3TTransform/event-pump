import { dynamodbHydrateOne } from "./connectors/dynamodb";
import { loadConfig } from "./yaml";
import { mssqlHydrateOne } from "./connectors/mssql";
import { ionHydrateOne } from "./connectors/ion";
import { blankFileIfExists, customProgressBar } from "./utils";
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
  let firstEvent = true;

  // create a progress bar
  progressBar.start(events.length, 0);

  // iterate the events in this set
  for (let event of events) {
    progressBar.update(events.indexOf(event)); // update the progress bar
    for (let pattern of doc.patterns) {
      // for each key and value in the pattern check for matching pattern in the event
      let matched = true;
      for (let [key, value] of Object.entries(pattern.rule)) {
        if (event[key] !== value) {
          matched = false;
        }
      }
    }

    const idColumnName = doc.sourceIDName ?? "id";

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
          if (firstEvent) {
            blankFileIfExists(pattern.action.file);
          }

          ionHydrateOne(pattern, event);
        }
        if (pattern.action.target === "dynamodb") {
          dynamodbHydrateOne(pattern, event);
        }
        if (pattern.action.target === "sql") {
          mssqlHydrateOne(pattern, event);
        }
      }
    }
    firstEvent = false;
  }
  progressBar.update(events.length);
  progressBar.stop();
}
