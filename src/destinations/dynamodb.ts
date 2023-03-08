import {
  DeleteItemInput,
  PutItemInput,
  GetItemInput,
  UpdateItemInput,
} from "aws-sdk/clients/dynamodb";
import { marshall, populateEventData } from "../utils";

const AWS = require("aws-sdk");
if (!process.env.AWS_DEFAULT_REGION) {
  throw new Error("AWS_DEFAULT_REGION is not set");
}
AWS.config.update({ region: process.env.AWS_DEFAULT_REGION });

class dyanmo {
  dyn: any;
  constructor() {
    // allow local endpoints by specifying the ENDPOINT_OVERRIDE variable like this:
    // export ENDPOINT_OVERRIDE=http://localhost:8000
    // export AWS_DEFAULT_REGION=eu-west-2
    let serviceConfigOptions: any = {};
    if (process.env.ENDPOINT_OVERRIDE) {
      serviceConfigOptions.endpoint = process.env.ENDPOINT_OVERRIDE;
      serviceConfigOptions.region = process.env.AWS_DEFAULT_REGION;
    }

    this.dyn = new AWS.DynamoDB(serviceConfigOptions);
  }
  scanTable = async (tableName: string, shouldLog: boolean = false) => {
    try {
      const data = await this.dyn.scan({ TableName: tableName }).promise();
      if (shouldLog) console.log(data);
      return data;
    } catch (err) {
      console.log(err);
    }
  };

  dynamodbTableExists = async (tableName: string) => {
    const data = await this.dyn.listTables().promise();
    if (data.TableNames) {
      if (data.TableNames.includes(tableName)) {
        return true;
      }
    }
    return false;
  };
  dynamodbWrite = async (params: PutItemInput) => {
    return await this.dyn.putItem(params).promise();
  };
  dynamodbGet = async (params: GetItemInput) => {
    return await this.dyn.getItem(params).promise();
  };
  dynamodbUpdate = async (params: UpdateItemInput) => {
    return await this.dyn.updateItem(params).promise();
  };
  dynamodbDelete = async (params: DeleteItemInput) => {
    return await this.dyn.deleteItem(params).promise();
  };
  dynamodbHydrateOne = async (
    pattern: any,
    event: any,
    isFirstEvent: boolean
  ) => {
    // check that the table in this action exists before we action on it
    if (!(await this.dynamodbTableExists(pattern.action.params.TableName))) {
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

      await this.dynamodbWrite(params);
    }
    if (thisVerb === "get") {
      const singleItem = populateEventData(
        event,
        pattern.action.params.Item,
        false
      );
      const newItem = marshall(singleItem);
      const params = { ...pattern.action.params };
      params.Item = newItem;

      await this.dynamodbGet(params);
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
        await this.dynamodbUpdate(params);
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
      await this.dynamodbDelete(params);
    }
  };
}

export default dyanmo;
