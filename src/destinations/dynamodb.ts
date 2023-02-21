import { PutItemInput, UpdateItemInput } from "aws-sdk/clients/dynamodb";
require("dotenv").config();

const AWS = require("aws-sdk");
if (process.env.AWS_DEFAULT_REGION) {
  AWS.config.update({ region: process.env.AWS_DEFAULT_REGION });
}

// allow local endpoints by specifying the ENDPOINT_OVERRIDE variable like this:
// export ENDPOINT_OVERRIDE=http://localhost:8000
let serviceConfigOptions: any = {};
if (process.env.ENDPOINT_OVERRIDE) {
  serviceConfigOptions.endpoint = process.env.ENDPOINT_OVERRIDE;
}

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

export {
  dynamodbTableExists,
  dynamodbWrite,
  dynamodbUpdate,
  dynamodbDelete,
  scanTable,
};
