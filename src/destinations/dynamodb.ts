import { PutItemInput, UpdateItemInput } from "aws-sdk/clients/dynamodb";

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


export { dynamodbTableExists, dynamodbWrite, dynamodbUpdate, dynamodbDelete, scanTable };
