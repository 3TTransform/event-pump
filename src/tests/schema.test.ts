import test from "ava";
test("exampletest", async (t) => {
  t.pass();
});

// import yaml from 'js-yaml';
// import fs from 'fs';
// import path from 'path';
// import Ajv from 'ajv';

// // Load the schema file
// const schemaFile = fs.readFileSync('./../schema/root.schema.json');
// const schema = JSON.parse(schemaFile.toString());

// // Define the test function
// function runYamlTest(t: any, file: string): void {
//   const yamlFile = fs.readFileSync(file);
//   const jsonData = yaml.load(yamlFile.toString());
//   const ajv = new Ajv();
//   const valid = ajv.validate(schema, jsonData);
//   t.true(valid, `Failed: ${file}`);
// }

// // Find and run tests for all YML files in a directory
// const testDir = './../examples';
// fs.readdirSync(testDir)
//   .filter((file) => path.extname(file) === '.yml')
//   .forEach((file) => {
//     const testTitle = `Testing ${file}`;
//     test(testTitle, (t) => runYamlTest(t, path.join(testDir, file)));
//   });
