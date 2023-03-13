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

## Quick Start Example

```sh
touch example.json
```
Paste this:

```json
[  
  {
    "verb": "create",
    "noun": "permission",
    "id": "de5cd33e-2c96-44c2-ae08-25a9e842a611",
    "name": "Add"
  },
  {
    "verb": "create",
    "noun": "permission",
    "id": "de5cd33e-2c96-44c2-ae08-25a9e842a612",
    "name": "Read"
  },
  {
    "verb": "create",
    "noun": "permission",
    "id": "de5cd33e-2c96-44c2-ae08-25a9e842a606",
    "name": "Remove"
  }
]
```

```sh
touch hydrate-permissions.yml
```

Paste this:
```yml
name: AWS Ion Permissions Example
source: 
  type: json
  file: ./example.json
patterns:
  - name: ionExample
    rule:
      noun: permission
      verb: create
    action:
      target: ion
      file: ./permissons.ion        
      shape:
        pk: "attestation#{{id}}"
        sk: "attestation"
        id: "{{id}}"
        name: "{{name}}"
```

Now hydrate your Ion from your JSON:

```sh
event-pump hydrate-permissions.yml
```


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

