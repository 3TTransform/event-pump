import test from "ava";
import fs from "fs";

import { getProp, populateEventData,  createFolderFromPath,  blankFileIfExists, customProgressBar,  parseCSV } from "../utils";

test("getProp", async (t) => {
  const deepObj = {
    a: 1,
    b: {
      c: 2,
      d: {
        e: 3,
        f: {
          g: 4,
        },
      },
    },
  };

  const cases = [
    {
      obj: { cake: { name: "chocolate", price: 10 } },
      path: "cake.name",
      expected: "chocolate",
    },
    {
      obj: { cake: { name: "chocolate", price: 10 } },
      path: "cake.price",
      expected: 10,
    },
    { obj: { cake: { lie: true } }, path: "cake.lies", expected: undefined },
    { obj: deepObj, path: "b.d.f.g", expected: 4 },
  ];

  cases.forEach((test) => {
    t.true(test.expected === getProp(test.obj, test.path));
  });
});

test("populateEventData", async (t) => {
  let result = populateEventData(
    { cake: { name: "{{cakeType}}", price: "{{cakePrice}}" } },
    {
      cakeType: "Cheese",
      cakePrice: 50,
    }
  );
  t.is(
    JSON.stringify(result),
    JSON.stringify({ cakeType: { S: "Cheese" }, cakePrice: { N: "50" } })
  );
});

test("createFolderFromPath", async (t) => {
  const filename = "isthistheresult/stupidFileName.txt";
  createFolderFromPath(filename);
  const folder = filename.substring(0, filename.lastIndexOf("/"));
  t.true( fs.existsSync(folder));
  fs.rmdirSync(folder);
});

test("blankFileIfExists", async (t) => {
  const filename = "testFile.txt";
  fs.writeFileSync(filename, "test text");
  blankFileIfExists(filename);
  const stats = fs.statSync(filename);
  const fileSizeInBytes = stats.size;
  t.true(fileSizeInBytes == 0);
  fs.unlinkSync(filename);
});

test("customProgressBar", async (t) => {
  const result = customProgressBar({
    name: "test"    
  });
  t.truthy(result);
});
   
test("parseCSV", async (t) => {
  const headerArr = "a,b,c,d,e,f";
  const rowArr = "1,2,3,4,5,6"
  const result = parseCSV(headerArr, rowArr);
  t.is(
    JSON.stringify(result),
    JSON.stringify({ a: '1', b: '2', c: '3', d: '4', e: '5', f: '6' })
  );
});
