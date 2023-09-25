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

The connection details are determined by the environment variables `SQL_SERV`, `SQL_USER`, `SQL_PASS` and `SQL_DB`.

## Open Search

> We can add records to an OpenSeach database.

_Example for OpenSeach:_

```yml
action:
    target: opensearch
    params:
        table_name: music
        number_of_shards: 4
        number_of_replicas: 3
```

The connection details are determined by the environment variables `OS_URL`, `OS_USER` and `OS_PASS`.

## PostgreSQL

> We can add records to a PostgreSQL database using an SQL invocation.

_Example for PostgreSQL:_

```yml
action:
    target: postgres
    params:
        sql: >
            INSERT INTO test1
            (FirstName, LastName)
            VALUES ('{{firstName}}', '{{lastName}}')
```

The connection details are determined by the environment variables `PG_USER`, `PG_PASS`, `PG_HOST`, `PG_DB` and `PG_PORT`.

## EventBus

> We can place records as events on an AWS Event Bus.

_Example for EventBus:_

```yml
action:
    target: event-bus
    eventBusName: ${EVENT_BUS_ARN}
    source: ${EVENT_SOURCE}
    detailType: Create Organisation
    shape:
        noun: organisation
        verb: create
        id: "{{id}}"
        organisationName: "{{organisationName}}"
```

The parser will attempt to resolve environment variable names in `eventBusName` and `source`.

## Lambda

> We can use the data in a records to invoke an AWS lambda function on. This function might in turn place an event on the event bus after some pre-processing.

_Example for Lambda:_

```yml
action:
    target: lambda
    functionName: ${LAMBDA_ARN}
    shape:
        DetailType: Create Organisation
        Source: source
        Detail:
            noun: organisation
            verb: create
            organisationId: "{{id}}"
            name: "{{organisationName}}"
    response:
        type: JSON
        path: hasError
        equalTo: false
```

The parser will attempt to resolve environment variable names in `eventBusName` and `source` parameters.

The `response` section allows the matching of fields in the lambda response to identify success or failure of the invocation. Currently, only `JSON` is supported as a type. If the `response` section is omitted then no errors will be reported and every invocation will be assumed to be a success. The `path` parameter determines the path to search for in the response and the `equalTo` parameter determines the value of this which will determine a success.


## debug-into

> Use this source to log events directly to the console. It is intended for use in developing and debugging the YML configuration files.

_Example for Lambda:_

```yml
action:
    target: debug-info
```
