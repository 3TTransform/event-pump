/*
given an object like this:
{ cake: { name: "chocolate", price: 10 } }
and a string like this:
"cake.name"
return the value of the property even if it is nested
*/
import fs from "fs";
import cliProgress from "cli-progress";
import colors from "ansi-colors";

const getProp = (obj: any, path: string) => {
  return path.split(".").reduce((o, i) => o[i], obj);
};

const populateEventData = (event: any, object: any) => {
  let rawItem = JSON.stringify(object);
  const regex = /{{(.*?)}}/g;
  const matches = rawItem.match(regex);

  if (matches) {
    for (let match of matches) {
      const prop = match.replace(/{{|}}/g, "");
      const eventValue = getProp(event, prop);

      if (eventValue === undefined) {
        rawItem = rawItem.replace(`":${prop}":"{{${prop}}}"`, "");
        rawItem = rawItem.replace(`,,`, ",");
        rawItem = rawItem.replace(`,}`, "}");
        rawItem = rawItem.replace(`{,`, "{");
      } else {
        rawItem = rawItem.replace(`{{${prop}}}`, eventValue);
      }
    }
  }

  return JSON.parse(rawItem);
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

const blankFileIfExists = (filename: string) => {
  const fileExists = fs.existsSync(filename);
  if (fileExists) {
    fs.writeFileSync(filename, "");
  }
};

const customProgressBar = (doc: any) => {
  return new cliProgress.SingleBar({
    format:
      doc.name +
      " |" +
      colors.cyan("{bar}") +
      "| {percentage}% || {value}/{total} events",
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
  });
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
  customProgressBar,
  parseCSV,
};
