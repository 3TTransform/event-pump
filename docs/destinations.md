# Destinations

> A destination is a place where an event can be sent. We can transform the data from the event and use it with any number of __supported__ destinations however we see fit.

We use [handlebars.js](https://handlebarsjs.com/guide/) in our template strings.

This means that if your `event` has a field called `name` then in the `action`, you can use the string `{{name}}` and we will replace the contents before we send it to your destination.

See the examples below for more information.

## AWS Ion

> AWS Ion is a format used by several AWS database services as an interchange/portable data format. It is used (for example) to import records into DynamoDb quickly and cheaply. Currently, support for Ion in the `event-pump` tool is limited and experimental.

_Example for AWS Ion:_

```yml
action:
    target: ion
    file: ./output/BakedGoodness.ion        
    shape:
      pk: "cake#{{id}}"
      sk: "pie"
      id: "{{id}}"
      cakeID: "{{cakeID}}"
      cakeName: "{{cakeName}}"
      isDelicious: "{{isDelicious}}"
```

## DynamoDb

> AWS DynamoDb is a NoSQL database. The `event-pump` tool supports DynamoDb as a destination. Data in the `params` object in the config yml as shown here is sent directly to the `aws-sdk` [found here](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html). We currently support `put`, `update` and `delete`.

_Example for DynamoDb:_

```yml
action:
  target: dynamodb
  type: put
  params:
    TableName: BakedGoodness
    Item:
      pk: "cake#{{id}}"
      sk: "pie"
      id: "{{id}}"
      cakeName: "{{cakeName}}"
```

## SQL Server

> We can send records to a Microsoft SQL Server. Setting up this server and having it accept records is beyond the scope of this document.

_Example for SQL Server:_

```yml
action:
    target: mssql
    params:
      sql: >
          INSERT INTO tbl_bakedGoodness
          ([id],[cakeID], [cakeName], [IsDeclicious])
          VALUES (@ID, @CakeID, @CakeName, @IsDelicious)
      input:
        - name: CakeID
          value: "{{cakeID}}"
        - name: CakeName
          value: "{{cakeName}}"
        - name: IsDelicious
          value: "{{isDelicious}}"
        - name: ID
          value: "{{id}}"
```
Notice the `sql` part of this config. We can specify the raw SQL to run. In yml we can create a multi-line text by using the `>` notation, as seein in this example.

The `input` part of the `params` allows us to perform text substitution on the variables in the `sql`. This helps avoid SQL injection and other complicated sci-fi mishaps.



