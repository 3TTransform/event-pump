const AWS = require("aws-sdk");

if (process.env.AWS_DEFAULT_REGION) {
  AWS.config.update({ region: process.env.AWS_DEFAULT_REGION });
}

// allow local endpoints by specifying the ENDPOINT_OVERRIDE variable like this:
// export ENDPOINT_OVERRIDE=http://localhost:8000
let serviceConfigOptions: any = {};
if (process.env.ENDPOINT_OVERRIDE) {
  serviceConfigOptions.endpoint = process.env.ENDPOINT_OVERRIDE;
  serviceConfigOptions.region = "eu-west-2";
}

// Initialize the DynamoDB client
const dynamodb = new AWS.DynamoDB(serviceConfigOptions);

const copyTable = async (sourceTableName: string, targetTableName: string) => {
  // Retrieve data from the source table
  const scanParams = { TableName: sourceTableName };
  dynamodb.scan(scanParams, function (err, data) {
    if (err) {
      console.log("Error:", err);
      return;
    }

    // Transform the data if needed
    const items = data.Items;

    console.log("Successfully scanned table");
    console.log("Copying", items.length, "Items");

    items.forEach(async (item) => {
      const PutItemInput = {
        TableName: targetTableName,
        Item: item,
      };
      //console.log(PutItemInput)
      await dynamodb.putItem(PutItemInput).promise();
    });
  });
};

export { copyTable };
