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
  t.true(valid, `Failed: ${file}\n${JSON.stringify(ajv.errors, null, 2)}`);
}

fs.readdirSync(EXAMPLES_LOCATION)
  .filter((file) => path.extname(file) === '.yml')
  .forEach((file) => {
    test(`🍏 ${file} matches schema`, (t) => runYamlTest(t, path.join(EXAMPLES_LOCATION, file)));
});




