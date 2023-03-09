require("dotenv").config();

import dynamo from "./destinations/dynamodb";
const ddb = new dynamo();

import { loadConfig } from "./yaml";
import { mssqlHydrateOne } from "./destinations/mssql";
import { ionHydrateOne } from "./destinations/ion";
import { customProgressBar, parseCSV } from "./utils";
import fs from "fs";

// to parse csv files
//import { parse } from "@fast-csv/parse";

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
    console.error("YML file is invalid");
    throw e;
  }
  const progressBar = customProgressBar(doc);

  let events = [];

  if (!doc.source) {
    throw new Error("No source defined");
  }
  switch (doc.source.type) {
    case "json":
      events = JSON.parse(fs.readFileSync(doc.source.file, "utf8"));
      break;
    case "csv":
      const csvData = fs.readFileSync(doc.source.file, "utf8");
      const rows = csvData.split("\n");
      const headers = rows[0];
      rows.forEach((row, index) => {
        if (index === 0) {
          return;
        }
        const parsedData = parseCSV(headers, row);
        events.push(parsedData);
      });
      break;
    case "dynamodb":
      const table = doc.source.table;
      // get the events from the source dynamo table
      const unmarshaledEvents: any = await ddb.scanTable(table);
      if (unmarshaledEvents && unmarshaledEvents.Items) {
        events = unmarshaledEvents.Items.map((item) => ddb.unmarshal(item));
      }
      break;
    default:
      throw new Error(`Source ${doc.source.type} is not supported`);
  }

  // so that we can do something only on the first event
  let isFirstEvent = true;

  // create a progress bar
  progressBar.start(events.length, 0);

  // iterate the events in this set
  for (let event of events) {
    // update the progress bar
    progressBar.update(events.indexOf(event));

    // iterate the events in this file
    for (let pattern of doc.patterns) {
      // for each key and value in the pattern check for matching pattern in the event
      let matched = true;
      for (let [key, value] of Object.entries(pattern.rule)) {
        if (event[key] !== value) {
          matched = false;
        }
      }
      if (matched && pattern.action) {
        //case swtich on the action target
        switch (pattern.action.target) {
          case "ion":
            await ionHydrateOne(pattern, event, isFirstEvent);
            console.log(event);
            break;
          case "dynamodb":
            await ddb.dynamodbHydrateOne(pattern, event, isFirstEvent);
            break;
          case "mssql":
            await mssqlHydrateOne(pattern, event, isFirstEvent);
            break;
          default:
            throw new Error(
              `Action target ${pattern.action.target} is not supported`
            );
        }
      }
    }
    isFirstEvent = false;
  }
  progressBar.update(events.length);
  progressBar.stop();
}
