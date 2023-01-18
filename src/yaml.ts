import yaml from "js-yaml";
import fs from "fs";

import { object, array, string, number, date, InferType } from "yup";

const configSchema = object({
  name: string(),
  defaultTarget: string(),
  // patterns is an array of obejcts
  patterns: array().of(
    object().shape({
      name: string(),
      rule: object(),
      action: object().shape({
        target: string(),
        query: string(),
      }),
    })
  ),
});

const loadConfig = async (ymlPath: string) => {
  const doc = yaml.load(fs.readFileSync(ymlPath, "utf8"));
  await configSchema.validate(doc);
  return doc;
};

/* 
given an object like this:
{ cake: { name: "chocolate", price: 10 } }
and a string like this:
"cake.name"
return the value of the property even if it is nested
*/
const getProp = (obj: any, path: string) => {
    return path.split(".").reduce((o, i) => o[i], obj);
};
export { getProp, configSchema, loadConfig };
