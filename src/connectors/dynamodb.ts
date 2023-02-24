import { PutItemInput, UpdateItemInput } from "aws-sdk/clients/dynamodb";
import { marshall, populateEventData } from "../utils";

const AWS = require("aws-sdk");

const serviceConfigOptions: any = {
  region: "eu-west-2",
  endpoint: "http://localhost:8000",
  credentials: {
    accessKeyId: "abc",
    secretAccessKey: "abc",
  },
};
const dyn: any = new AWS.DynamoDB(serviceConfigOptions);

const scanTable = async (tableName: string) => {
  try {
    const data = await dyn.scan({ TableName: tableName }).promise();
    console.log(data);
  } catch (err) {
    console.log(err);
  }
};

// a function to confirm a dynamodb table exists
const dynamodbTableExists = async (tableName: string) => {
  const data = await dyn.listTables().promise();
  if (data.TableNames) {
    if (data.TableNames.includes(tableName)) {
      return true;
    }
  }
  return false;
};

// a dynamodb function to write to a table
const dynamodbWrite = async (params: PutItemInput) => {
  return await dyn.putItem(params).promise();
};
const dynamodbUpdate = async (params: UpdateItemInput) => {
  return await dyn.updateItem(params).promise();
};

const dynamodbDelete = async (params: any) => {
  return await dyn.deleteItem(params).promise();
};

const dynamodbHydrateOne = async (pattern: any, event: any, isFirstEvent: boolean) => {
  // check that the table in this action exists before we action on it
  if (!(await dynamodbTableExists(pattern.action.params.TableName))) {
    throw new Error(
      `Table '${pattern.action.params.TableName}' does not exist`
    );
  }

  const thisVerb = pattern.rule.verb;

  if (thisVerb === "create") {
    const singleItem = populateEventData(
      event,
      pattern.action.params.Item,
      false
    );
    const newItem = marshall(singleItem);
    const params = { ...pattern.action.params };
    params.Item = newItem;

    await dynamodbWrite(params);
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
  }
};

export {
  dynamodbTableExists,
  dynamodbWrite,
  dynamodbUpdate,
  dynamodbDelete,
  scanTable,
  dynamodbHydrateOne,
};
