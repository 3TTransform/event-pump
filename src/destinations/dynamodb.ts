import { PutItemInput } from "aws-sdk/clients/dynamodb";

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

// a function to automatically marshals Javascript types onto DynamoDB AttributeValues
const marshall = (data: any) => {
  const result: any = {};
  for (const key of Object.keys(data)) {
    const value = data[key];
    if (value === null || value === undefined) {
      result[key] = { NULL: true };
    } else if (typeof value === "string") {
      result[key] = { S: value };
    } else if (typeof value === "number") {
      result[key] = { N: value.toString() };
    } else if (typeof value === "boolean") {
      result[key] = { BOOL: value };
    } else if (value instanceof Date) {
      result[key] = { S: value.toISOString() };
    } else if (Array.isArray(value)) {
      result[key] = { L: marshall(value) };
    } else if (typeof value === "object") {
      result[key] = { M: marshall(value) };
    } else {
      throw new Error(`Unsupported type: ${typeof value}`);
    }
  }
  return result;
};

export { dynamodbTableExists, dynamodbWrite, scanTable, marshall };
