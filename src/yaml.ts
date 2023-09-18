import yaml from 'js-yaml';
import fs from 'fs';

import { object, array, string } from 'yup';

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
        }),
    ),
});

const loadConfig = async (ymlPath: string) => {
    const doc = yaml.load(fs.readFileSync(ymlPath, 'utf8'));
    await configSchema.validate(doc);
    return doc;
};

export { configSchema, loadConfig };
