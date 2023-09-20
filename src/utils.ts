import fs from 'fs';
import { replaceValues } from './template';

const getProp = (obj: unknown, path: string) => {
    return path.split('.').reduce((o, i) => o[i], obj);
};

const replaceEnvVars = (text: string) => {
    if (!text)
    {
        return text;
    }
    const regex = /\$\{([a-zA-Z_]+\w*)\}/g;
    return text.replace(regex, (substring, ...args) => process.env[args[0]] ?? substring);
};

const populateEventData = (event: unknown, object: unknown) => {
    if (!object || !event) {
        return object;
    }

    return JSON.parse(JSON.stringify(object), (key, value) => {
        if (typeof value !== 'string') {
            return value;
        }

        // if the entire entry is a token {{?}} then replace
        // the whole thing preserving type from data
        const fullMatch = value.match(/^{{([^{}]*?)}}$/g);
        if (fullMatch && fullMatch.length === 1) {
            const prop = fullMatch[0].replace(/{{|}}/g, '');
            return getProp(event, prop);
        }

        try {
            // otherwise just make a string using Handlebars
            return replaceValues(event, value);
        } catch (error) {
            // or don't change anything if there is an error
            return value;
        }
    });
};

const createFolderFromPath = (filename: string) => {
    if (!filename) {
        return;
    }

    const folder = filename.substring(0, filename.lastIndexOf('/'));

    if (folder && !fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }
};

const blankFileIfExists = (filename: string): boolean => {
    const fileExists = fs.existsSync(filename);
    if (fileExists) {
        fs.writeFileSync(filename, '');
        return true;
    }
    return false;
};

function parseCSV(headers, row) {
    // Split the headers and row into arrays
    const headerArr = headers.split(',');
    const rowArr = row.split(',');

    // Map the row data to the corresponding headers and create a new object
    const resultObj = {};
    headerArr.forEach((header, index) => {
        if (rowArr[index]) {
            resultObj[header.trim()] = rowArr[index].trim();
        }
    });

    return resultObj;
}

export {
    populateEventData,
    getProp,
    createFolderFromPath,
    blankFileIfExists,
    parseCSV,
    replaceEnvVars,
};
