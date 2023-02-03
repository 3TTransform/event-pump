import { UpdateItemInput } from "aws-sdk/clients/dynamodb";
import {
  dynamodbWrite,
  dynamodbTableExists,
  dynamodbDelete,
  dynamodbUpdate,
} from "./destinations/dynamodb";
import { loadConfig } from "./yaml";
import { marshall, getProp, populateEventData } from './utils'
import { runSQL } from "./destinations/mssql";

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
            if (!(await dynamodbTableExists(pattern.action.params.TableName))) {
              throw new Error(
                `Table '${pattern.action.params.TableName}' does not exist`
              );
            }

            const thisVerb = pattern.rule.verb;

            if (thisVerb === "create") {
              // for each key and value in the item, get the property from the event
              let rawItem = JSON.stringify(pattern.action.params.Item);
              const regex = /{{(.*?)}}/g;
              const matches = rawItem.match(regex);
              if (matches) {
                for (let match of matches) {
                  const prop = match.replace(/{{|}}/g, "");
                  const eventValue = getProp(event, prop);

                  if (eventValue === undefined) {
                    rawItem = rawItem.replace(`"${prop}":"{{${prop}}}"`, "");
                    rawItem = rawItem.replace(`,,`, ",");
                    rawItem = rawItem.replace(`,}`, "}");
                  }
                  else {
                    rawItem = rawItem.replace(`{{${prop}}}`, eventValue);
                  }
                }
              }

              let singleItem: any = JSON.parse(rawItem);
              const newItem = marshall(singleItem);
              const params = { ...pattern.action.params };
              params.Item = newItem;

              await dynamodbWrite(params);
              console.log(
                `${singleItem.id} written to ${pattern.action.params.TableName}`
              );
            }
            if (thisVerb === "update") {

              let singleItem = populateEventData(event, pattern.action.params.ExpressionAttributeValues);

              // loop over the single item and build the 'UpdateExpression'
              let updateExpression = 'set ';
              const updateExpArr = [];

              for (let [key, value] of Object.entries(singleItem)) {
                updateExpArr.push(`${key.replace(':', '')} = ${key}`);
              }

              updateExpression += updateExpArr.join(', ');

              const params = { ...pattern.action.params };
              params.UpdateExpression = updateExpression;
              params.ExpressionAttributeValues = singleItem;

              params.Key = populateEventData(event, params.Key);

              if (updateExpArr.length > 0) {
                await dynamodbUpdate(params);
                console.log(
                  `${params.Key.pk.S} updated to ${pattern.action.params.TableName}`
                );
              }
              else {
                console.log(
                  `${params.Key.pk.S} not updated to ${pattern.action.params.TableName}`
                );
              }

            }
            if (thisVerb === "delete") {
              // for each key and value in the item, get the property from the event
              let rawItem = JSON.stringify(pattern.action.params.Item);
              const regex = /{{(.*?)}}/g;
              const matches = rawItem.match(regex);
              if (matches) {
                for (let match of matches) {
                  const prop = match.replace(/{{|}}/g, "");
                  const eventValue = getProp(event, prop);

                  if (eventValue === undefined) {
                    rawItem = rawItem.replace(`"${prop}":"{{${prop}}}"`, "");
                    rawItem = rawItem.replace(`,,`, ",");
                    rawItem = rawItem.replace(`,}`, "}");
                  }
                  else {
                    rawItem = rawItem.replace(`{{${prop}}}`, eventValue);
                  }
                }
              }

              let singleItem: any = JSON.parse(rawItem);
              const newItem = marshall(singleItem);
              const params = { ...pattern.action.params };
              params.Item = newItem;

              params.Key = params.Item;
              delete params.Item;
              await dynamodbDelete(params);
              console.log(
                `${singleItem.id} deleted from ${pattern.action.params.TableName}`
              );
            }
          }
        }
        if (pattern.action.target === "sql"){
          
          let singleItem = populateEventData(event, pattern.action.params);
          const thisVerb = pattern.rule.verb;
          if (thisVerb === "create"){
            console.log(singleItem.sql.S);
            console.log(pattern.action.params.input);
            const result = await runSQL(singleItem.sql.S);
            console.log(JSON.stringify(result));
          }
        }
      }
    }
  }

}
