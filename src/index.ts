import {
  marshall,
  dynamodbWrite,
  dynamodbTableExists,
} from "./destinations/dynamodb";
import { loadConfig, getProp } from "./yaml";

export interface CliParams {
  yml: string;
}

export async function processEvents(params: CliParams) {
  let doc;

  try {
    // load and vanidate the config file
    doc = await loadConfig(params.yml);
  } catch (e) {
    console.log("YML file is invalid");
    console.log(e.errors);
  }

  // the source property is the file location of a json file, load it into an object
  const events = require(doc.source);

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
        if (pattern.action.target === "dynamodb") {
          if (pattern.action.params) {
            // this is an sdk call with params
            if (!(await dynamodbTableExists(pattern.action.params.TableName))) {
              throw new Error(
                `Table '${pattern.action.params.TableName}' does not exist`
              );
            }

            // for each key and value in the item, get the property from the event
            let rawItem = JSON.stringify(pattern.action.params.Item);
            const regex = /{{(.*?)}}/g;
            const matches = rawItem.match(regex);
            if (matches) {
              for (let match of matches) {
                const prop = match.replace(/{{|}}/g, "");
                const eventValue = getProp(event, prop);
                rawItem = rawItem.replace(`{{${prop}}}`, eventValue);
              }
            }
            let singleItem: any = JSON.parse(rawItem);
            const newItem = marshall(singleItem);
            const params = { ...pattern.action.params };
            params.Item = newItem;
            await dynamodbWrite(params);
            console.log(`${singleItem.id} written to ${pattern.action.params.TableName}`);
          }
        }
      }
    }
  }
}
