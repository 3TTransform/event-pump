import test from "ava";
require("dotenv").config();
import dynamo from "../destinations/dynamodb";
const ddb = new dynamo();
//export AWS_DEFAULT_REGION=eu-west-2

/* 	scanTable
/		dynamodbTableExists
/		dynamodbWrite
/  	dynamodbUpdate
/		dynamodbDelete
/		dynamodbHydrateOne
*/

// scanTable
test("🍏 scanTable", async (t) => {
  const table = "Example";
  const result = await ddb.scanTable(table);
  t.truthy(result);
});

test("🍎 scanTable (not exists)", async (t) => {
  await t.throwsAsync(
    async () => {
      await ddb.scanTable("Example2");
    },
    { message: "Requested resource not found" }
  );
});

// dynamodbTableExists
test("🍏 dynamodbTableExists (exists)", async (t) => {
  const table = "Example";
  const result = await ddb.dynamodbTableExists(table);
  t.true(result);
});

test("🍏 dynamodbTableExists (Does not exist)", async (t) => {
  const table = "Example2";
  const result = await ddb.dynamodbTableExists(table);
  t.false(result);
});

// dynamodb CRUD
test("🍏 dynamodbCRUD", async (t) => {
  // dynamodbWrite
  const params = {
    TableName: "Example",
    Item: {
      pk: { S: "organisation#1234" },
      sk: { S: "organisation" },
      id: { S: "1234" },
      organisationName: { S: "Test Organisation" },
    },
  };
  const result = await ddb.dynamodbWrite(params);
  t.assert(Object.entries(result).length === 0);

  // dynamodbGet
  const params2 = {
    TableName: "Example",
    Key: {
      pk: { S: "organisation#1234" },
      sk: { S: "organisation" },
    },
  };
  const result2 = await ddb.dynamodbGet(params2);
  t.assert(result2.Item.organisationName.S, "Test Organisation");

  // dynamodbUpdate
  const params3 = {
    TableName: "Example",
    Key: {
      pk: { S: "organisation#1234" },
      sk: { S: "organisation" },
    },
    UpdateExpression: "SET id=:id, organisationName=:organisationName",
    ExpressionAttributeValues: {
      ":id": { S: "1234" },
      ":organisationName": { S: "Test Organisation 3" },
    },
  };
  const result3 = await ddb.dynamodbUpdate(params3);
  t.assert(Object.entries(result3).length === 0);

  // dynamodbGet
  const params4 = {
    TableName: "Example",
    Key: {
      pk: { S: "organisation#1234" },
      sk: { S: "organisation" },
    },
  };
  const result4 = await ddb.dynamodbGet(params4);
  t.assert(result4.Item.organisationName.S, "Test Organisation 3");

  //dynamodbDelete
  const params5 = {
    TableName: "Example",
    Key: {
      pk: { S: "organisation#1234" },
      sk: { S: "organisation" },
    },
  };
  const result5 = await ddb.dynamodbDelete(params5);
  t.assert(Object.entries(result5).length === 0);

  // dynamodbGet
  const params6 = {
    TableName: "Example",
    Key: {
      pk: { S: "organisation#1234" },
      sk: { S: "organisation" },
    },
  };
  const result6 = await ddb.dynamodbGet(params6);
  t.assert(Object.entries(result6).length === 0);
});
// dynamodbHydrateOne ?????
