import {
  dynamodbWrite,
  dynamodbTableExists,
  dynamodbDelete,
  dynamodbUpdate,
  scanTable,
  unmarshal,
} from "./destinations/dynamodb";
import { copyTable } from "./destinations/copydynamodb";
import { loadConfig } from "./yaml";
import { marshall, populateEventData } from "./utils";
import { runSQL } from "./destinations/mssql";

import { replaceValues } from "./template";

export interface CliParams {
  yml: string;
}

export async function processEvents(params: CliParams) {
  let doc;

  try {
    // load and validate the config file
    doc = await loadConfig(params.yml);
  } catch (e) {
    console.log("YML file is invalid");
    console.log(e.errors);
  }

  if (doc.patterns[0].name == "copyTable") {
    const sTable = doc.patterns[0].action.params.sourceTableName;
    const tTable = doc.patterns[0].action.params.targetTableName;
    const region = doc.patterns[0].action.params.region;
    copyTable(region, sTable, tTable);
  } else {
    let events;
    // the source property is the file location of a json file, load it into an object
    if (typeof doc.source === "string") {
      events = require(doc.source);
    } else {
      if (doc.source.type === "dynamodb") {
        const table = doc.source.table;
        // get the events from the source dynamo table
        const unmarshaledEvents = await scanTable(table);
        events = unmarshaledEvents.Items.map((item) => {
          return unmarshal(item);
        });
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
        if (matched) {
          if (pattern.action.target === "debug") {
            console.log("🎫", pattern.action);
          }
          if (pattern.action.target === "dynamodb") {

            if (pattern.action.params) {

              // check that the table in this action exists before we action on it
              if (
                !(await dynamodbTableExists(pattern.action.params.TableName))
              ) {
                throw new Error(
                  `Table '${pattern.action.params.TableName}' does not exist`
                );
              }

              const thisVerb = pattern.rule.verb;

              if (thisVerb === "create" || thisVerb === "received") {
                const singleItem = populateEventData(
                  event,
                  pattern.action.params.Item,
                  false
                );
                const newItem = marshall(singleItem);
                const params = { ...pattern.action.params };
                params.Item = newItem;

                await dynamodbWrite(params);
                console.log(
                  `${singleItem.id} written to ${pattern.action.params.TableName}`
                );
              }
              if (thisVerb === "update") {
                let singleItem = populateEventData(
                  event,
                  pattern.action.params.ExpressionAttributeValues
                );

                // loop over the single item and build the 'UpdateExpression'
                let updateExpression = "set ";
                const updateExpArr = [];

                for (let [key, value] of Object.entries(singleItem)) {
                  updateExpArr.push(`${key.replace(":", "")} = ${key}`);
                }

                updateExpression += updateExpArr.join(", ");

                const params = { ...pattern.action.params };
                params.UpdateExpression = updateExpression;
                params.ExpressionAttributeValues = singleItem;

                params.Key = populateEventData(event, params.Key);

                if (updateExpArr.length > 0) {
                  await dynamodbUpdate(params);
                  console.log(
                    `${params.Key.pk.S} updated to ${pattern.action.params.TableName}`
                  );
                } else {
                  console.log(
                    `${params.Key.pk.S} not updated to ${pattern.action.params.TableName}`
                  );
                }
              }
              if (thisVerb === "delete") {
                const singleItem = populateEventData(
                  event,
                  pattern.action.params.Item,
                  false
                );
                const newItem = marshall(singleItem);
                const params = { ...pattern.action.params };
                params.Item = newItem;

                params.Key = params.Item;
                delete params.Item;
                await dynamodbDelete(params);
                console.log(
                  `${params.Key.pk.S} deleted from ${pattern.action.params.TableName}`
                );
              }
            }
          }
          if (pattern.action.target === "sql") {
            let sql = pattern.action.params.sql;
            let input = pattern.action.params.input;

            const sqlStatement = populateEventData(event, input, false);

            const thisVerb = pattern.rule.verb;

            let replacedSQL = replaceValues(event, sql);
            replacedSQL = replacedSQL.replace(/,\s*WHERE/g, " WHERE");
            try {
              await runSQL(replacedSQL, sqlStatement);
              console.log(`${event.id} ${thisVerb}d`);
            } catch (err) {
              console.log(`${event.id} failed ${err.message}`);
            }
          }
        }
      }
    }
  }
}
