const AWS = require("aws-sdk");

const copyTable = async (region: string, sourceTableName: string, targetTableName: string) => {
  if (process.env.AWS_DEFAULT_REGION) {
    AWS.config.update({ region: process.env.AWS_DEFAULT_REGION });
  }
  
  // allow local endpoints by specifying the ENDPOINT_OVERRIDE variable like this:
  // export ENDPOINT_OVERRIDE=http://localhost:8000
  let serviceConfigOptions: any = {};
  if (process.env.ENDPOINT_OVERRIDE) {
    serviceConfigOptions.endpoint = process.env.ENDPOINT_OVERRIDE;
    serviceConfigOptions.region = region;
  }
  
  // Initialize the DynamoDB client
  const dynamodb = new AWS.DynamoDB(serviceConfigOptions);

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
      await dynamodb.putItem(PutItemInput).promise();
    });
  });
};

export { copyTable };
