import {
  DeleteItemInput,
  PutItemInput,
  GetItemInput,
  UpdateItemInput,
} from "aws-sdk/clients/dynamodb";
import { populateEventData } from "../utils";

const AWS = require("aws-sdk");
AWS.config.update({ region: process.env.AWS_DEFAULT_REGION || "us-east-2" });

class Dyanmo {
  dyn: any;
  constructor() {
    // allow local endpoints by specifying the ENDPOINT_OVERRIDE variable like this:
    // export ENDPOINT_OVERRIDE=http://localhost:8000
    // export AWS_DEFAULT_REGION=us-east-2
    let serviceConfigOptions: any = {};
    if (process.env.ENDPOINT_OVERRIDE) {
      serviceConfigOptions.endpoint = process.env.ENDPOINT_OVERRIDE;
      serviceConfigOptions.region =
        process.env.AWS_DEFAULT_REGION || "us-east-2";
    }

    this.dyn = new AWS.DynamoDB(serviceConfigOptions);
  }
  generateUpdateQuery = (fields: any) => {
    // take in an object and delete verything that is null
    Object.keys(fields).forEach((key) => {
      if (fields[key] === undefined) {
        delete fields[key];
      }
    });
    // 'fields' is now an object with all null things removed
    const exp: any = {
      UpdateExpression: "",
      ExpressionAttributeNames: {},
      ExpressionAttributeValues: {},
    };

    exp.UpdateExpression += `SET `;

    // loop through the fields we have left and build our expression
    Object.entries(fields).forEach(([key, item]) => {
      exp.UpdateExpression += ` #${key} = :${key},`;
      exp.ExpressionAttributeNames[`#${key}`] = key;
      exp.ExpressionAttributeValues[`:${key}`] = item;
    });

    // remove the last comma on the text field
    exp.UpdateExpression = exp.UpdateExpression.slice(0, -1);

    //return our shiny new expression
    return exp;
  };
  marshal = (item) => {
    return AWS.DynamoDB.Converter.marshall(item);
  };
  unmarshal = (item) => {
    return AWS.DynamoDB.Converter.unmarshall(item);
  };
  scanTable = async (tableName: string, lastEvaluatedKey: any = null) => {
    return await this.dyn
      .scan({
        TableName: tableName,
        Limit: 10,
        ExclusiveStartKey: lastEvaluatedKey,
      })
      .promise();
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

    const thisActionType = pattern.action.type;

    if (thisActionType === "put") {
      const singleItem = populateEventData(event, pattern.action.params.Item);
      const newItem = this.marshal(singleItem);
      const params = { ...pattern.action.params };
      params.Item = newItem;

      await this.dynamodbWrite(params);
    }
    if (thisActionType === "update") {
      const singleItem = populateEventData(event, pattern.action);
      const updateQuery = this.generateUpdateQuery(singleItem.values);
      updateQuery.TableName = pattern.action.params.TableName;
      updateQuery.Key = this.marshal(singleItem.params.Key);
      updateQuery.ExpressionAttributeValues = this.marshal(updateQuery.ExpressionAttributeValues);
      await this.dynamodbUpdate(updateQuery);
    }
    if (thisActionType === "delete") {
      const singleItem = populateEventData(event, pattern.action.params.Item);
      const newItem = this.marshal(singleItem);
      const params = { ...pattern.action.params };
      params.Item = newItem;

      params.Key = params.Item;
      delete params.Item;
      await this.dynamodbDelete(params);
    }
  };
}

export default Dyanmo;
