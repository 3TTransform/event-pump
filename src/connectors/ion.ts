import { populateEventData, createFolderFromPath } from "../utils";

const ion = require("ion-js");
const fs = require("fs");

const ionWriter = {
  write: (data: any, filename: string) => {
    const ionData = ion.load(JSON.stringify(data));
    const ionText = ion.dumpText(ionData);
    createFolderFromPath(filename);
    fs.appendFileSync(filename, `$ion_1_0 {Item:${ionText}}\n`);
    return ionText;
  },
};

const ionHydrateOne = async (pattern: any, event: any) => {
  const singleItem = populateEventData(event, pattern.action.shape, false);
  ionWriter.write(singleItem, pattern.action.file);
};

export { ionHydrateOne };
