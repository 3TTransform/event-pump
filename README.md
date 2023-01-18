# Event Pump CLI

> An event driven ETL tool

- Read the events from an event store
- Using rules, cherry pick the events we are interested in
- Update a data store for each event

Includes:

- [TypeScript](https://www.typescriptlang.org/), for writing good code
- [Ava](https://www.npmjs.com/package/ava), for writing good tests
- [Commander](https://www.npmjs.com/package/commander), for building CLI applications
- [Pkg](https://www.npmjs.com/package/pkg), for building cross-platform native executables

Your application will be installable from `npm` or by sharing your native executables.

## Usage

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
name: Event stream to DynamoDB
defaultTarget: dynamodb
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

