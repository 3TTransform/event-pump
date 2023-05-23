import test from 'ava';
import fs from 'fs';
import sinon from 'sinon';

import {
  getProp,
  populateEventData,
  createFolderFromPath,
  blankFileIfExists,
  parseCSV,
} from '../utils';

test('🍏 getProp should return the values at the specified paths', async (t) => {
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
      obj: { cake: { name: 'chocolate', price: 10 } },
      path: 'cake.name',
      expected: 'chocolate',
    },
    {
      obj: { cake: { name: 'chocolate', price: 10 } },
      path: 'cake.price',
      expected: 10,
    },
    {
      obj: { cake: { lie: true } },
      path: 'cake.lies',
      expected: undefined,
    },
    { obj: deepObj, path: 'b.d.f.g', expected: 4 },
  ];

  cases.forEach((test) => {
    t.true(test.expected === getProp(test.obj, test.path));
  });
});

test('🍎 getProp should return undefined for non-existent path', (t) => {
  const obj = {
    foo: {
      bar: {
        baz: 'qux',
      },
    },
  };
  const path = 'foo.bar.xyz';
  const result = getProp(obj, path);

  t.is(result, undefined);
});

test('🍎 getProp should throw an error for non-object/null/undefined parameters', async (t) => {
  const cases = [
    {
      obj: "Test text",
      path: 'b.d.f.g',
      expected: 'Cannot read properties of undefined (reading \'d\')',
    },
    {
      obj: null,
      path: 'b.d.f.g',
      expected: 'Cannot read properties of null (reading \'b\')',
    },
    {
      obj: { cake: { name: 'chocolate', price: 10 } },
      path: null,
      expected: 'Cannot read properties of null (reading \'split\')',
    },
    {
      obj: null,
      path: null,
      expected: 'Cannot read properties of null (reading \'split\')',
    },
    {
      obj: undefined,
      path: 'b.d.f.g',
      expected: 'Cannot read properties of undefined (reading \'b\')',
    },
    {
      obj: { cake: { name: 'chocolate', price: 10 } },
      path: undefined,
      expected: 'Cannot read properties of undefined (reading \'split\')',
    },
    {
      obj: undefined,
      path: undefined,
      expected: 'Cannot read properties of undefined (reading \'split\')',
    },
  ];
  cases.forEach((test) => {
    t.throws(
      () => {
        getProp(test.obj, test.path);
      },
      { instanceOf: TypeError, message: test.expected }
    );
  });
});

test('🍏 populateEventData should populate event data correctly', async (t) => {
  const result = populateEventData(
    {
      cakeType: 'Cheese',
      cakePrice: 50,
      cakeExists: null,
      cakeIsLie: true,
    },
    {
      cake: {
        name: '{{cakeType}}cake',
        price: '{{cakePrice}}',
        exists: '{{cakeExists}}',
        isLie: '{{cakeIsLie}}',
      },
    }
  );
  t.is(
    JSON.stringify(result),
    JSON.stringify({
      cake: { name: 'Cheesecake', price: 50, exists: null, isLie: true },
    })
  );
});
test('🍎 populateEventData should handle missing properties in event', (t) => {
  const event = {
    id: '123',
    name: 'John Doe',
  };
  const object = {
    id: '{{id}}',
    fullName: '{{name}}',
    age: '{{age}}',
    paid: '{{height}}cm',
  };
  const result = populateEventData(event, object);
  t.deepEqual(result, {
    fullName: 'John Doe',
    id: '123',
    paid: 'cm'
  });
});

test('🍏 populateEventData should handle nested properties', (t) => {
  const event = {
    person: {
      name: 'John Doe',
      age: 25,
    },
  };
  const object = {
    fullName: '{{person.name}}',
    age: '{{person.age}}',
  };

  const result = populateEventData(event, object);

  t.deepEqual(result, {
    fullName: 'John Doe',
    age: 25,
  });
});



test('🍏 populateEventData should handle static text', async (t) => {
  const result = populateEventData(
    { cakeType: 'Cheese', cakePrice: 50 },
    '{{cakeType}}'
  );
  t.is(JSON.stringify(result), JSON.stringify('Cheese'));
});

test('🍎 populateEventData should handle mismatched {', async (t) => {
  const result = populateEventData(
    { cakeType: 'Cheese', cakePrice: 50 },
    { cake: { name: '{{cakeType}', price: '{{cakePrice}}' } }
  );
  t.is(
    JSON.stringify(result),
    JSON.stringify({ cake: { name: '{{cakeType}', price: 50 } })
  );
});
test('🍎 populateEventData should handle mismatched }', async (t) => {
  const result = populateEventData(
    { cakeType: 'Cheese', cakePrice: 50 },
    { cake: { name: '{{cakeType}}', price: '{cakePrice}}' } }
  );
  t.is(
    JSON.stringify(result),
    JSON.stringify({ cake: { name: 'Cheese', price: '{cakePrice}}' } })
  );
});

test('🍎 populateEventData should handle a null event', async (t) => {
  const result = populateEventData(null, {
    cake: { name: '{{cakeType}}', price: '{cakePrice}}' },
  });
  t.is(
    JSON.stringify(result),
    JSON.stringify({
      cake: { name: '{{cakeType}}', price: '{cakePrice}}' },
    })
  );
});
test('🍎 populateEventData should handle an undefined event', async (t) => {
  const result = populateEventData(undefined, {
    cake: { name: '{{cakeType}}', price: '{cakePrice}}' },
  });
  t.is(
    JSON.stringify(result),
    JSON.stringify({
      cake: { name: '{{cakeType}}', price: '{cakePrice}}' },
    })
  );
});
test('🍎 populateEventData should handle a null object', async (t) => {
  const result = populateEventData({ cakeType: 'Cheese', cakePrice: 50 }, null);
  t.is(result, null);
});
test('🍎 populateEventData should handle an undefined object', async (t) => {
  const result = populateEventData({ cakeType: 'Cheese', cakePrice: 50 }, undefined);
  t.is(JSON.stringify(result), undefined);
});
test('🍎 populateEventData should handle the case when both event and object are null', async (t) => {
  const result = populateEventData(null, null);
  t.is(result, null);
});
test('🍎 populateEventData should handle the case when both event and object are undefined', async (t) => {
  const result = populateEventData(undefined, undefined);
  t.is(JSON.stringify(result), undefined);
});

test.serial('🍏 createFolderFromPath should create the folder if it does not exist', (t) => {
  const existsSyncStub = sinon.stub(fs, 'existsSync').returns(false);
  const mkdirSyncStub = sinon.stub(fs, 'mkdirSync');

  createFolderFromPath('path/to/file.txt');

  t.true(existsSyncStub.calledOnceWithExactly('path/to'));
  t.true(mkdirSyncStub.calledOnceWithExactly('path/to', { recursive: true }));

  existsSyncStub.restore();
  mkdirSyncStub.restore();
});
test.serial('🍎 createFolderFromPath should not create the folder if it already exists', (t) => {
  const existsSyncStub = sinon.stub(fs, 'existsSync').returns(true);
  const mkdirSyncStub = sinon.stub(fs, 'mkdirSync');

  createFolderFromPath('existing/folder/file.txt');

  t.true(existsSyncStub.calledOnceWithExactly('existing/folder'));
  t.true(mkdirSyncStub.notCalled);

  existsSyncStub.restore();
  mkdirSyncStub.restore();
});
test.serial('🍎 createFolderFromPath should not create the folder if the filename does not contain any slashes', (t) => {
  const existsSyncStub = sinon.stub(fs, 'existsSync');
  const mkdirSyncStub = sinon.stub(fs, 'mkdirSync');

  createFolderFromPath('filename.txt');

  t.true(existsSyncStub.notCalled);
  t.true(mkdirSyncStub.notCalled);

  existsSyncStub.restore();
  mkdirSyncStub.restore();
});
test.serial('🍎 createFolderFromPath should not create the folder if the filename is null', (t) => {
  const existsSyncStub = sinon.stub(fs, 'existsSync');
  const mkdirSyncStub = sinon.stub(fs, 'mkdirSync');

  createFolderFromPath(null);

  t.true(existsSyncStub.notCalled);
  t.true(mkdirSyncStub.notCalled);

  existsSyncStub.restore();
  mkdirSyncStub.restore();
});
test.serial('🍎 createFolderFromPath should not create the folder if the filename is undefined', (t) => {
  const existsSyncStub = sinon.stub(fs, 'existsSync');
  const mkdirSyncStub = sinon.stub(fs, 'mkdirSync');

  createFolderFromPath(undefined);

  t.true(existsSyncStub.notCalled);
  t.true(mkdirSyncStub.notCalled);

  existsSyncStub.restore();
  mkdirSyncStub.restore();
});
test.serial('🍎 createFolderFromPath should not create the folder if the filename is empty', (t) => {
  const existsSyncStub = sinon.stub(fs, 'existsSync');
  const mkdirSyncStub = sinon.stub(fs, 'mkdirSync');

  createFolderFromPath('');

  t.true(existsSyncStub.notCalled);
  t.true(mkdirSyncStub.notCalled);

  existsSyncStub.restore();
  mkdirSyncStub.restore();
});

test.serial('🍏 blankFileIfExists should blank the file and return true if it exists', (t) => {
  const filename = 'path/to/file.txt';
  const existsSyncStub = sinon.stub(fs, 'existsSync').returns(true);
  const writeFileSyncStub = sinon.stub(fs, 'writeFileSync');

  const result = blankFileIfExists(filename);

  t.true(existsSyncStub.calledOnceWithExactly(filename));
  t.true(writeFileSyncStub.calledOnceWithExactly(filename, ''));
  t.true(result);

  existsSyncStub.restore();
  writeFileSyncStub.restore();
});
test.serial('🍎 blankFileIfExists should return false if the file does not exist', (t) => {
  const filename = 'nonexistent/file.txt';
  const existsSyncStub = sinon.stub(fs, 'existsSync').returns(false);
  const writeFileSyncStub = sinon.stub(fs, 'writeFileSync');

  const result = blankFileIfExists(filename);

  t.true(existsSyncStub.calledOnceWithExactly(filename));
  t.true(writeFileSyncStub.notCalled);
  t.false(result);

  existsSyncStub.restore();
  writeFileSyncStub.restore();
});
test.serial('🍎 blankFileIfExists should return false if the filename is null', (t) => {
  const filename = null;
  const existsSyncStub = sinon.stub(fs, 'existsSync').returns(false);
  const writeFileSyncStub = sinon.stub(fs, 'writeFileSync');

  const result = blankFileIfExists(filename);

  t.true(existsSyncStub.calledOnceWithExactly(filename));
  t.true(writeFileSyncStub.notCalled);
  t.false(result);

  existsSyncStub.restore();
  writeFileSyncStub.restore();
});
test.serial('🍎 blankFileIfExists should return false if the filename is undefined', (t) => {
  const filename = undefined;
  const existsSyncStub = sinon.stub(fs, 'existsSync').returns(false);
  const writeFileSyncStub = sinon.stub(fs, 'writeFileSync');

  const result = blankFileIfExists(filename);

  t.true(existsSyncStub.calledOnceWithExactly(filename));
  t.true(writeFileSyncStub.notCalled);
  t.false(result);

  existsSyncStub.restore();
  writeFileSyncStub.restore();
});
test.serial('🍎 blankFileIfExists should return false if the filename is empty', (t) => {
  const filename = '';
  const existsSyncStub = sinon.stub(fs, 'existsSync').returns(false);
  const writeFileSyncStub = sinon.stub(fs, 'writeFileSync');

  const result = blankFileIfExists(filename);

  t.true(existsSyncStub.calledOnceWithExactly(filename));
  t.true(writeFileSyncStub.notCalled);
  t.false(result);

  existsSyncStub.restore();
  writeFileSyncStub.restore();
});

test('🍏 parseCSV should parse headers and row into an object', (t) => {
  const headers = 'name, age, city';
  const row = 'John Doe, 25, New York';

  const result = parseCSV(headers, row);

  t.deepEqual(result, {
    name: 'John Doe',
    age: '25',
    city: 'New York',
  });
});
test('🍏 parseCSV should handle missing values in the row', (t) => {
  const headers = 'name, age, city';
  const row = 'John Doe, , New York';

  const result = parseCSV(headers, row);

  t.deepEqual(result, {
    name: 'John Doe',
    age: '',
    city: 'New York',
  });
});
test('🍏 parseCSV should ignore extra values in the row', (t) => {
  const headers = 'name, age';
  const row = 'John Doe, 25, New York';

  const result = parseCSV(headers, row);

  t.deepEqual(result, {
    name: 'John Doe',
    age: '25',
  });
});
test('🍏 parseCSV should handle empty headers and row', (t) => {
  const headers = '';
  const row = '';

  const result = parseCSV(headers, row);

  t.deepEqual(result, {});
});
test('🍎 parseCSV throws an error if header and row are both undefined', async (t) => {
  t.throws(
    () => {
      parseCSV(undefined, undefined);
    },
    {
      instanceOf: TypeError,
      message: 'Cannot read properties of undefined (reading \'split\')',
    }
  );
});
test('🍎 parseCSV throws an error if header and row are both null', async (t) => {
  t.throws(
    () => {
      parseCSV(null, null);
    },
    {
      instanceOf: TypeError,
      message: 'Cannot read properties of null (reading \'split\')',
    }
  );
});
