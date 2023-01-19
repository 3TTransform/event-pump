# Event Pump CLI

> An event driven ETL tool

- Read the events from an event store
- Using rules, cherry pick the events we are interested in
- Update a data store for each event

## Quick Start Example

1. Start DynamoDB locally - `docker run -itd -p 8000:8000  --name dev-db amazon/dynamodb-local:latest -jar DynamoDBLocal.jar -sharedDb`
2. Configure aws-cli, you may use any secret keys or region, it does not matter: `aws configure`
3. Create an `Example` table with a pk and sk as the HASH and RANGE keys:

```
aws dynamodb create-table --table-name Example --attribute-definitions AttributeName=pk,AttributeType=S AttributeName=sk,AttributeType=S --key-schema AttributeName=pk,KeyType=HASH AttributeName=sk,KeyType=RANGE --billing-mode PAY_PER_REQUEST --endpoint-url http://localhost:8000
```

4. Run the tool locally: `npm run dev -- -f example.yml`
5. Install local DynamoDB browser: `npm install -g dynamodb-admin`
6. Go to URL and view data: `http://localhost:8001/tables/Example`

## Software Used

- [TypeScript](https://www.typescriptlang.org/), for writing good code
- [Ava](https://www.npmjs.com/package/ava), for writing good tests
- [Commander](https://www.npmjs.com/package/commander), for building CLI applications
- [Pkg](https://www.npmjs.com/package/pkg), for building cross-platform native executables

Your application will be installable from `npm` or by sharing your native executables.

## Develop

### **dev**

`npm run dev`

Runs the CLI application.

You can pass arguments to your application by running `npm run dev -- --your-argument`. The extra `--` is so that your arguments are passed to your CLI application, and not `npm`.

### **clean**

`npm run clean`

Removes any built code and any built executables.

### **build**

`npm run build`

Cleans, then builds the TypeScript code.

Your built code will be in the `./dist/` directory.

### **test**

`npm run test`

Cleans, then builds, and tests the built code.

### **bundle**

`npm run bundle`

Cleans, then builds, then bundles into native executables for Windows, Mac, and Linux.

Your shareable executables will be in the `./exec/` directory.

## Examples

#### Every time a create organisation event occurs, add it to a DynamoDB table

```yml
name: Event pump to DynamoDB
patterns:
- name: organisationCreate
  rule:
    noun: organisation
    verb: create
  action:
    target: dynamodb
    params:
      TableName: Example
      Item:
        pk: "organisation#{{id}}"
        sk: "organisation"
        id: "{{id}}"
        name: "{{name}}"
```

