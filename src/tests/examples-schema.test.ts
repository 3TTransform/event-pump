import ava from 'ava';
import test from 'ava';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';

const SCHEMA_FILE_LOCATION = 'schema/root.schema.json'
const EXAMPLES_LOCATION = 'examples'

const schemaFile = fs.readFileSync(SCHEMA_FILE_LOCATION);
const schema = JSON.parse(schemaFile.toString());

function runYamlTest(t: any, file: string): void {
  const yamlFile = fs.readFileSync(file);
  const jsonData = yaml.load(yamlFile.toString());
  const ajv = new Ajv();
  const valid = ajv.validate(schema, jsonData);
  if (!valid)
  {

    console.log(file);
    console.log(ajv.errors);
    console.log('-----------------------------');
  }
  t.true(valid, `Failed: ${file}`);
}

fs.readdirSync(EXAMPLES_LOCATION)
  .filter((file) => path.extname(file) === '.yml')
  .forEach((file) => {
    const testTitle = `Testing ${file}`;
    test(testTitle, (t) => runYamlTest(t, path.join(EXAMPLES_LOCATION, file)));
});




