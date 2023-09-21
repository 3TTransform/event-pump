import test from 'ava';
import { getProp, populateEventData, parseCSV, replaceEnvVars } from '../utils';

test('🍏 getProp should return the values at the specified paths', async t => {
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

    cases.forEach(test => {
        t.true(test.expected === getProp(test.obj, test.path));
    });
});
test('🍎 getProp should return undefined for non-existent path', t => {
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
test('🍎 getProp should throw an error for non-object/null/undefined parameters', async t => {
    const cases = [
        {
            obj: 'Test text',
            path: 'b.d.f.g',
            expected: "Cannot read properties of undefined (reading 'd')",
        },
        {
            obj: null,
            path: 'b.d.f.g',
            expected: "Cannot read properties of null (reading 'b')",
        },
        {
            obj: { cake: { name: 'chocolate', price: 10 } },
            path: null,
            expected: "Cannot read properties of null (reading 'split')",
        },
        {
            obj: null,
            path: null,
            expected: "Cannot read properties of null (reading 'split')",
        },
        {
            obj: undefined,
            path: 'b.d.f.g',
            expected: "Cannot read properties of undefined (reading 'b')",
        },
        {
            obj: { cake: { name: 'chocolate', price: 10 } },
            path: undefined,
            expected: "Cannot read properties of undefined (reading 'split')",
        },
        {
            obj: undefined,
            path: undefined,
            expected: "Cannot read properties of undefined (reading 'split')",
        },
    ];
    cases.forEach(test => {
        t.throws(
            () => {
                getProp(test.obj, test.path);
            },
            { instanceOf: TypeError, message: test.expected },
        );
    });
});

test('🍏 populateEventData should populate event data correctly', async t => {
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
        },
    );
    t.is(
        JSON.stringify(result),
        JSON.stringify({
            cake: { name: 'Cheesecake', price: 50, exists: null, isLie: true },
        }),
    );
});
test('🍎 populateEventData should handle missing properties in event', t => {
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
        paid: 'cm',
    });
});
test('🍏 populateEventData should handle nested properties', t => {
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
test('🍏 populateEventData should handle static text', async t => {
    const result = populateEventData(
        { cakeType: 'Cheese', cakePrice: 50 },
        '{{cakeType}}',
    );
    t.is(JSON.stringify(result), JSON.stringify('Cheese'));
});
test('🍎 populateEventData should handle mismatched {', async t => {
    const result = populateEventData(
        { cakeType: 'Cheese', cakePrice: 50 },
        { cake: { name: '{{cakeType}', price: '{{cakePrice}}' } },
    );
    t.is(
        JSON.stringify(result),
        JSON.stringify({ cake: { name: '{{cakeType}', price: 50 } }),
    );
});
test('🍎 populateEventData should handle mismatched }', async t => {
    const result = populateEventData(
        { cakeType: 'Cheese', cakePrice: 50 },
        { cake: { name: '{{cakeType}}', price: '{cakePrice}}' } },
    );
    t.is(
        JSON.stringify(result),
        JSON.stringify({ cake: { name: 'Cheese', price: '{cakePrice}}' } }),
    );
});
test('🍎 populateEventData should handle a null event', async t => {
    const result = populateEventData(null, {
        cake: { name: '{{cakeType}}', price: '{cakePrice}}' },
    });
    t.is(
        JSON.stringify(result),
        JSON.stringify({
            cake: { name: '{{cakeType}}', price: '{cakePrice}}' },
        }),
    );
});
test('🍎 populateEventData should handle an undefined event', async t => {
    const result = populateEventData(undefined, {
        cake: { name: '{{cakeType}}', price: '{cakePrice}}' },
    });
    t.is(
        JSON.stringify(result),
        JSON.stringify({
            cake: { name: '{{cakeType}}', price: '{cakePrice}}' },
        }),
    );
});
test('🍎 populateEventData should handle a null object', async t => {
    const result = populateEventData(
        { cakeType: 'Cheese', cakePrice: 50 },
        null,
    );
    t.is(result, null);
});
test('🍎 populateEventData should handle an undefined object', async t => {
    const result = populateEventData(
        { cakeType: 'Cheese', cakePrice: 50 },
        undefined,
    );
    t.is(JSON.stringify(result), undefined);
});
test('🍎 populateEventData should handle the case when both event and object are null', async t => {
    const result = populateEventData(null, null);
    t.is(result, null);
});
test('🍎 populateEventData should handle the case when both event and object are undefined', async t => {
    const result = populateEventData(undefined, undefined);
    t.is(JSON.stringify(result), undefined);
});

test('🍏 parseCSV should parse headers and row into an object', t => {
    const headers = 'name, age, city';
    const row = 'John Doe, 25, New York';
    const result = parseCSV(headers, row);
    t.deepEqual(result, {
        name: 'John Doe',
        age: '25',
        city: 'New York',
    });
});
test('🍏 parseCSV should handle missing values in the row', t => {
    const headers = 'name, age, city';
    const row = 'John Doe, , New York';
    const result = parseCSV(headers, row);
    t.deepEqual(result, {
        name: 'John Doe',
        age: '',
        city: 'New York',
    });
});
test('🍏 parseCSV should handle missing values at then end of the row', t => {
    const headers = 'name, age, city';
    const row = 'John Doe, 25';
    const result = parseCSV(headers, row);
    t.deepEqual(result, {
        name: 'John Doe',
        age: '25',
    });
});
test('🍏 parseCSV should ignore extra values in the row', t => {
    const headers = 'name, age';
    const row = 'John Doe, 25, New York';
    const result = parseCSV(headers, row);
    t.deepEqual(result, {
        name: 'John Doe',
        age: '25',
    });
});

test('🍏 parseCSV should handle empty headers and row', t => {
    const headers = '';
    const row = '';
    const result = parseCSV(headers, row);
    t.deepEqual(result, {});
});
test('🍎 parseCSV throws an error if header and row are both undefined', async t => {
    t.throws(
        () => {
            parseCSV(undefined, undefined);
        },
        {
            instanceOf: TypeError,
            message: "Cannot read properties of undefined (reading 'split')",
        },
    );
});
test('🍎 parseCSV throws an error if header and row are both null', async t => {
    t.throws(
        () => {
            parseCSV(null, null);
        },
        {
            instanceOf: TypeError,
            message: "Cannot read properties of null (reading 'split')",
        },
    );
});

test('🍏 replaceEnvVars replaces environment variables tokens in input', async t => {
    const env_backup = { ... process.env};
    process.env.TEST_123 = 'TEST_123_CONTENT';

    const test_result = replaceEnvVars('${TEST_123}');

    t.deepEqual(test_result, 'TEST_123_CONTENT');

    process.env = { ... env_backup};
});
test('🍏 replaceEnvVars does not replace missing environment variables', async t => {
    const env_backup = { ... process.env};
    process.env.TEST_123 = 'TEST_123_CONTENT';

    const test_result = replaceEnvVars('${TEST_1234}');

    t.deepEqual(test_result, '${TEST_1234}');

    process.env = { ... env_backup};
});

test('🍏 replaceEnvVars replaces partial string', async t => {
    const env_backup = { ... process.env};
    process.env.TEST_123 = 'TEST_123_CONTENT';
    process.env.TEST_456 = 'TEST_456_CONTENT';

    const test_result = replaceEnvVars('${TEST_123} and ${TEST_456}');

    t.deepEqual(test_result, 'TEST_123_CONTENT and TEST_456_CONTENT');

    process.env = { ... env_backup};
});

test('🍎 replaceEnvVars does not replace when supplied with null', async t => {
    const env_backup = { ... process.env};
    process.env.TEST_123 = 'TEST_123_CONTENT';

    const test_result = replaceEnvVars(null);

    t.deepEqual(test_result, null);

    process.env = { ... env_backup};
});

test('🍎 replaceEnvVars does not replace when supplied with undefined', async t => {
    const env_backup = { ... process.env};
    process.env.TEST_123 = 'TEST_123_CONTENT';

    const test_result = replaceEnvVars(undefined);

    t.deepEqual(test_result, undefined);

    process.env = { ... env_backup};
});

