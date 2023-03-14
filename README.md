# event-pump

![Header logo](https://i.imgur.com/eImlHXR.jpg)


[![github](https://img.shields.io/badge/%20-3T%20Transform-black?style=for-the-badge&logo=github)](https://github.com/3TTransform)
[![website](https://img.shields.io/badge/%20-3T%20Transform-orange?style=for-the-badge)](https://www.3t-transform.com)
[![blog](https://img.shields.io/badge/%20-Dev%20blog-lightgrey?style=for-the-badge&logo=dev.to
)](https://blog.3tplatform.com)
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/company/3t-transform/mycompany/)
[![twitter](https://img.shields.io/badge/twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/3t_transform?lang=en)
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
- 🎉 [Configuration YML](https://github.com/3TTransform/event-pump/blob/master/docs/config.md)
- 🎉 [Event Sources](https://github.com/3TTransform/event-pump/blob/master/docs/sources.md)
- 🎉 [Event Destinations](https://github.com/3TTransform/event-pump/blob/master/docs/destinations.md)

# Examples

- 🎁 [AWS Ion Example](https://github.com/3TTransform/event-pump/blob/master/docs/example-awsion.md)
- 🎁 [DynamoDb Example](https://github.com/3TTransform/event-pump/blob/master/docs/example-dynamodb.md)

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




![Footer logo](https://i.imgur.com/BUVAMRF.png)