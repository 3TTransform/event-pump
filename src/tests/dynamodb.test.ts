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
test("scanTable", async (t) => {
	const table = "Example";
	const result = await ddb.scanTable(table);
	//console.log(JSON.stringify(result));
	t.pass(typeof result);
});
