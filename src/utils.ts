import fs from "fs";

const getProp = (obj: any, path: string) => {
  return path.split(".").reduce((o, i) => o[i], obj);
};

// Can be solved by using handlebars
const populateEventData = (event: any, object: any) => {
  if (!object || !event) {
    return object;
  }
  return JSON.parse(JSON.stringify(object), (key, value) => {

    if (typeof value !== 'string') {
      return value;
    }
    const fullMatch = value.match(/^{{([^{}]*?)}}$/g);
    if (fullMatch && fullMatch.length === 1) {
      const prop = fullMatch[0].replace(/{{|}}/g, "");
      return getProp(event, prop);
    }

    const matches = value.match(/{{(.{0,64}?)}}/g);
    if (!matches) {
      return value;
    }

    for (let match of matches) {
      const prop = match.replace(/{{|}}/g, "");
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
  // get the folder from pattern.action.file
  const folder = filename.substring(0, filename.lastIndexOf("/"));
  // check if the folder exists, if not create it

  const folderExists = fs.existsSync(folder);
  if (!folderExists) {
    fs.mkdirSync(folder, { recursive: true });
  }
};

const blankFileIfExists = (filename: string): boolean => {
  const fileExists = fs.existsSync(filename);
  if (fileExists) {
    fs.writeFileSync(filename, "");
    return true;
  }
  return false;
};

function parseCSV(headers, row) {
  // Split the headers and row into arrays
  const headerArr = headers.split(",");
  const rowArr = row.split(",");

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
