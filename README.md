# event-pump

# 🎫 An event driven ETL tool

- Read the events from an event store
- Using rules, cherry pick the events we are interested in
- Update a data store for each event

# Install
```sh
npm install event-pump -g
event-pump --version
```

# Docs

- 🎉 [Configuration YML](docs/config.md)
- 🎉 [Event Sources](docs/sources.md)
- 🎉 [Event Destinations](docs/destinations.md)

# Examples

- 🎁 [AWS Ion Example](docs/example-awsion.md)
- 🎁 [DynamoDb Example](docs/example-dynamodb.md)

## Contributing

- [TypeScript](https://www.typescriptlang.org/), for writing good code
- [Ava](https://www.npmjs.com/package/ava), for writing good tests
- [Commander](https://www.npmjs.com/package/commander), for building CLI applications
- [Pkg](https://www.npmjs.com/package/pkg), for building cross-platform native executables

Your application will be installable from `npm` or by sharing your native executables.

### **dev**
```sh
npm run dev
```
Runs the CLI application.

You can pass arguments to your application by running `npm run dev -- --your-argument`. The extra `--` is so that your arguments are passed to your CLI application, and not `npm`.

### **clean**

```sh
npm run clean
```

Removes any built code and any built executables.

### **build**
```sh
npm run build
```
Cleans, then builds the TypeScript code.

Your built code will be in the `./dist/` directory.

### **test**

```sh
npm run test
```

Cleans, then builds, and tests the built code.

### **bundle**
```sh
npm run bundle
```
Cleans, then builds, then bundles into native executables for Windows, Mac, and Linux.

> 💡 Your shareable executables will be in the `./exec/` directory.

