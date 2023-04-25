import test from "ava";
import fs from "fs";

import { getProp, populateEventData, createFolderFromPath, blankFileIfExists, customProgressBar, parseCSV } from "../utils";

test("🍏 getProp", async (t) => {
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


test("🍎 getProp", async (t) => {
  const cases = [
    { obj: null, path: "b.d.f.g", expected: "Cannot read properties of null (reading \'b\')" },
    { obj: { cake: { name: "chocolate", price: 10 } }, path: null, expected: "Cannot read properties of null (reading \'split\')" },
    { obj: null, path: null, expected: "Cannot read properties of null (reading \'split\')" },
    { obj: undefined, path: "b.d.f.g", expected: "Cannot read properties of undefined (reading \'b\')" },
    { obj: { cake: { name: "chocolate", price: 10 } }, path: undefined, expected: "Cannot read properties of undefined (reading \'split\')" },
    { obj: undefined, path: undefined, expected: "Cannot read properties of undefined (reading \'split\')" },
  ];
  cases.forEach((test) => {
    t.throws(() => {
      getProp(test.obj, test.path);
    },
      { instanceOf: TypeError, message: test.expected });
  });
});

test("🍏 populateEventData (object)", async (t) => {
  let result = populateEventData(
    { cakeType: "Cheese", cakePrice: 50, cakeExists: null, cakeIsLie: true },
    { cake: { name: "{{cakeType}}", price: "{{cakePrice}}", exists: "{{cakeExists}}", isLie: "{{cakeIsLie}}" } }
  );
  t.is(
    JSON.stringify(result),
    JSON.stringify({ cake: { name: "Cheese", price: 50, "exists": null, "isLie": true } })
  );
});
test("🍏 populateEventData (static text)", async (t) => {
  let result = populateEventData(
    { cakeType: "Cheese", cakePrice: 50 },
    "{{cakeType}}"
  );
  t.is(
    JSON.stringify(result),
    JSON.stringify("Cheese")
  );
});
test("🍎 populateEventData missing }", async (t) => {
  let result = populateEventData(
    { cakeType: "Cheese", cakePrice: 50 },
    { cake: { name: "{{cakeType}", price: "{{cakePrice}}" } }
  );
  t.is(
    JSON.stringify(result),
    JSON.stringify({ cake: { name: "{{cakeType}", price: 50 } })
  );
});

test("🍎 populateEventData missing {", async (t) => {
  let result = populateEventData(
    { cakeType: "Cheese", cakePrice: 50 },
    { cake: { name: "{{cakeType}}", price: "{cakePrice}}" } }
  );
  t.is(
    JSON.stringify(result),
    JSON.stringify({ cake: { name: "Cheese", price: "{cakePrice}}" } })
  );
});
test("🍎 populateEventData null/object", async (t) => {
  let result = populateEventData(
    null,
    { cake: { name: "{{cakeType}}", price: "{cakePrice}}" } }
  );
  t.is(
    JSON.stringify(result),
    JSON.stringify({ cake: { name: "{{cakeType}}", price: "{cakePrice}}" } })
  );
});
test("🍎 populateEventData event/null", async (t) => {
  let result = populateEventData(
    { cakeType: "Cheese", cakePrice: 50 },
    null
  );
  t.is(result, null);
});
test("🍎 populateEventData null/null", async (t) => {
  let result = populateEventData(null, null);
  t.is(result, null);
});

test("🍎 populateEventData undefined/object", async (t) => {
  let result = populateEventData(
    undefined,
    { cake: { name: "{{cakeType}}", price: "{cakePrice}}" } }
  );
  t.is(
    JSON.stringify(result),
    JSON.stringify({ cake: { name: "{{cakeType}}", price: "{cakePrice}}" } })
  );
});
test("🍎 populateEventData event/undefined", async (t) => {
  let result = populateEventData(
    { cakeType: "Cheese", cakePrice: 50 },
    undefined
  );
  t.is(
    JSON.stringify(result),
    undefined
  );
});
test("🍎 populateEventData undefined/undefined", async (t) => {
  let result = populateEventData(undefined, undefined);
  t.is(
    JSON.stringify(result),
    undefined
  );
});

test("🍏 createFolderFromPath('TestFolder/TestFile.txt')", async (t) => {
  const filename = 'TestFolder/TestFile.txt';
  createFolderFromPath(filename);
  const folder = filename.substring(0, filename.lastIndexOf("/"));
  t.true(fs.existsSync(folder));
  fs.rmdirSync(folder);
});

test("🍎 createFolderFromPath(null)", async (t) => {
  const filename = null;
  t.throws(() => {
    createFolderFromPath(filename);
  }, {
    instanceOf: TypeError,
    message: 'Cannot read properties of null (reading \'substring\')'
  });
});

test("🍎 createFolderFromPath(undefined)", async (t) => {
  const filename = undefined;
  t.throws(() => {
    createFolderFromPath(filename);
  }, {
    instanceOf: TypeError,
    message: 'Cannot read properties of undefined (reading \'substring\')'
  });
});

// DEBT TODO fix this test
// test("🍎 createFolderFromPath('TestFolder?/TestFile.txt')", async (t) => {
//   const filename = 'TestFolder?/TestFile.txt';
//   t.throws(() => {
//     createFolderFromPath(filename);
//   }, {
//     instanceOf: Error,
//     message: 'ENOENT: no such file or directory, mkdir \'TestFolder?\''
//   });
// });

test("🍏 blankFileIfExists('testFile.txt')", async (t) => {
  const filename = "testFile.txt";
  fs.writeFileSync(filename, "test text");
  const result = blankFileIfExists(filename);
  t.true(result);
  const stats = fs.statSync(filename);
  const fileSizeInBytes = stats.size;
  t.true(fileSizeInBytes == 0);
  fs.unlinkSync(filename);
});

test("🍎 blankFileIfExists(null)", async (t) => {
  const filename = null;
  const result = blankFileIfExists(filename);
  t.false(result);
});

test("🍎 blankFileIfExists(undefined)", async (t) => {
  const filename = undefined;
  const result = blankFileIfExists(filename);
  t.false(result);
});

test("🍎 blankFileIfExists('TestFile?.txt')", async (t) => {
  const filename = 'TestFile?.txt';
  const result = blankFileIfExists(filename);
  t.false(result);
});

test("🍏 customProgressBar({name: 'test'})", async (t) => {
  const result = customProgressBar({
    name: "test"
  });
  t.truthy(result);
  t.is(typeof result, 'object');
  t.assert(result.options.format === 'test |\u001b[36m{bar}\u001b[39m| {percentage}% || {value}/{total} events');
});
test("🍏 customProgressBar({name: null})", async (t) => {
  const result = customProgressBar({
    name: null
  });
  t.truthy(result);
  t.is(typeof result, 'object');
  t.assert(result.options.format === 'null |\u001b[36m{bar}\u001b[39m| {percentage}% || {value}/{total} events');
});
test("🍏 customProgressBar({})", async (t) => {
  const result = customProgressBar({});
  t.truthy(result);
  t.is(typeof result, 'object');
  t.assert(result.options.format === 'undefined |\u001b[36m{bar}\u001b[39m| {percentage}% || {value}/{total} events');
});

test("🍏 parseCSV", async (t) => {
  const headerArr = "a,b,c,d,e,f";
  const rowArr = "1,2,3,4,5,6"
  const result = parseCSV(headerArr, rowArr);
  t.is(
    JSON.stringify(result),
    JSON.stringify({ a: '1', b: '2', c: '3', d: '4', e: '5', f: '6' })
  );
});
test("🍎 parseCSV(undefined header, undefined row)", async (t) => {

  t.throws(() => {
    const result = parseCSV(undefined, undefined);
  }, {
    instanceOf: TypeError,
    message: 'Cannot read properties of undefined (reading \'split\')'
  });
});
test("🍎 parseCSV(null header, null row)", async (t) => {

  t.throws(() => {
    const result = parseCSV(null, null);
  }, {
    instanceOf: TypeError,
    message: 'Cannot read properties of null (reading \'split\')'
  });
});
test("🍏 parseCSV('' header, '' row)", async (t) => {
  const result = parseCSV('', '');
  t.is(
    JSON.stringify(result),
    JSON.stringify({})
  );
});
test("🍏 parseCSV('col1,col2,col3' header, '1,2' row)", async (t) => {
  const result = parseCSV('col1,col2,col3', '1,2');
  t.is(
    JSON.stringify(result),
    JSON.stringify({ col1: "1", col2: "2" })
  );
});
test("🍏 parseCSV('col1,col2' header, '1,2,3' row)", async (t) => {
  const result = parseCSV('col1,col2', '1,2,3');
  t.is(
    JSON.stringify(result),
    JSON.stringify({ col1: "1", col2: "2" })
  );
});
test("🍎 parseCSV('col1,col2' header, null row)", async (t) => {
  t.throws(() => {
    const result = parseCSV('col1,col2', null);
  }, {
    instanceOf: TypeError,
    message: 'Cannot read properties of null (reading \'split\')'
  });
});
test("🍎 parseCSV(null header, '1,2,3' row)", async (t) => {
  t.throws(() => {
    const result = parseCSV(null, '1,2,3');
  }, {
    instanceOf: TypeError,
    message: 'Cannot read properties of null (reading \'split\')'
  });
});