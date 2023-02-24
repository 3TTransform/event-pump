import {
  populateEventData,
  createFolderFromPath,
  blankFileIfExists,
} from "../utils";

const ion = require("ion-js");
const fs = require("fs");

const ionHydrateOne = async (
  pattern: any,
  event: any,
  isFirstEvent: boolean
) => {
  if (isFirstEvent) {
    blankFileIfExists(pattern.action.file); // clear the file
  }

  // replace the values in the event with the values from the pattern
  const singleItem = populateEventData(event, pattern.action.shape, false);

  // convert to ion
  const ionData = ion.load(JSON.stringify(singleItem));

  // convert to text
  const ionText = ion.dumpText(ionData);

  // use the file path and make sure the folder exists
  createFolderFromPath(pattern.action.file);

  // write the ion rowto the file
  fs.appendFileSync(pattern.action.file, `$ion_1_0 {Item:${ionText}}\n`);
};

export { ionHydrateOne };
