import fs from 'fs';

const getProp = (obj: unknown, path: string) => {
    return path.split('.').reduce((o, i) => o[i], obj);
};

// Can be solved by using handlebars
const populateEventData = (event: unknown, object: unknown) => {
    if (!object || !event) {
        return object;
    }
    return JSON.parse(JSON.stringify(object), (key, value) => {

        if (typeof value !== 'string') {
            return value;
        }
        const fullMatch = value.match(/^{{([^{}]*?)}}$/g);
        if (fullMatch && fullMatch.length === 1) {
            const prop = fullMatch[0].replace(/{{|}}/g, '');
            return getProp(event, prop);
        }

        const matches = value.match(/{{(.{0,64}?)}}/g);
        if (!matches) {
            return value;
        }

        for (const match of matches) {
            const prop = match.replace(/{{|}}/g, '');
            const eventValue = getProp(event, prop);
            if (eventValue) {
                value = value.replace(`{{${prop}}}`, eventValue);
            }
            else {
                value = value.replace(`{{${prop}}}`, '');
            }
        }
        return value;
    });
};

const createFolderFromPath = (filename: string) => {
    if (!filename)
    {
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
};
