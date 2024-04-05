import test from 'ava';
import Handlebars from 'handlebars';
import { replaceValues } from '../../template';

export const UUID_PATTERN =
    /^[0-9a-fA-F]{8}-(?:[0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/g;
export const ULID_PATTERN = /^[0-9A-Za-z]{10}[0-9A-HJ-NP-Za-km-z]{16}$/;

test('🍏 replaceValues should replace values correctly (1)', async t => {
    const result = replaceValues(
        { cakeType: 1, cakeExists: false },
        'cakeType: {{#removeLastChar}}{{cakeType}}, {{cakeExists}}, {{filling}} {{/removeLastChar}}',
    );
    t.assert(result, 'cakeType: 1, false');
});

test('🍏 sha256 should hash values correctly', async t => {
    const result = replaceValues(
        { cakeType: 1, cakeExists: false, cakeName: 'testName' },
        'cakeType: {{sha256 cakeName}}',
    );
    t.assert(
        result ===
            'cakeType: 4278d90b65ee634b960c9e026e4295f8f4fd8d3f29785548552afdc71ef4b495',
    );
});

test('🍏 emailToUUID should convert to UUID correctly', async t => {
    const result = replaceValues(
        { cakeType: 1, cakeExists: false, cakeName: 'testName' },
        'cakeType: {{emailToUUID cakeName}}',
    );
    t.assert(result === 'cakeType: 64e16ce1-1f10-5087-acbf-eec022f74bbb');
});

test('🍏 emailToULID should convert to ULID correctly', async t => {
    const result = replaceValues(
        { cakeType: 1, cakeExists: false, cakeName: 'testName' },
        'cakeType: {{emailToULID cakeName}}',
    );
    
    console.log(result);
    t.assert(result === 'cakeType: 34W5PE27RGA23TSFZER0HFEJXV');
});

test('🍏 emailsInArrayToUUIDs should convert emails to UUIDs correctly in an array of obkects', async t => {
    const result = replaceValues(
        { cakeType: 1, cakeExists: false, cakeName: '[{"email":"fp@email.com","firstName":"First","lastName":"Person"},{"email":"sp@email.com","firstName":"Second","lastName":"Person"}]' },
        "cakeType: {{{emailsInArrayToUUIDs cakeName 'email' 'id'}}}",
    );
    t.assert(result === 'cakeType: [{"firstName":"First","lastName":"Person","id":"0d3cf462-87fa-514e-9148-75d0dfe71e86"},{"firstName":"Second","lastName":"Person","id":"a4f788a2-1442-526f-9d4e-a30a9d1b7848"}]');
});

test('🍏 UUIDtoULID should convert to ULID correctly', async t => {
    const result = replaceValues(
        {
            cakeType: 1,
            cakeExists: false,
            cakeUUID: '64e16ce1-1f10-5087-acbf-eec022f74bbb',
        },
        'cakeULID: {{UUIDtoULID cakeUUID}}',
    );
    t.regex(result.split(' ')[1], ULID_PATTERN);
    t.assert(result === 'cakeULID: 34W5PE27RGA23TSFZER0HFEJXV');
});

test('🍏 randomUUID should generate a random uuid', async t => {
    const result = replaceValues(
        { cakeType: 1, cakeExists: false, cakeName: 'testName' },
        '{{randomUUID}}',
    );
    t.regex(result, UUID_PATTERN);
});

test('🍏 randomUUID should generate a random ulid', async t => {
    const result = replaceValues(
        { cakeType: 1, cakeExists: false, cakeName: 'testName' },
        '{{randomULID}}',
    );
    t.regex(result, ULID_PATTERN);
});

test('🍏 replaceValues should replace values correctly (2)', t => {
    const data = {
        name: 'John Doe',
        age: 25,
    };
    const source = 'My name is {{name}} and I am {{age}} years old.';
    const expected = 'My name is John Doe and I am 25 years old.';

    const result = replaceValues(data, source);

    t.is(result, expected);
});

test('🍎 replaceValues should handle missing values', t => {
    const data = {
        name: 'John Doe',
    };
    const source = 'My name is {{name}} and I am {{age}} years old.';
    const expected = 'My name is John Doe and I am  years old.';

    const result = replaceValues(data, source);

    t.is(result, expected);
});

test('🍎 replaceValues should handle multiple occurrences of the same value', t => {
    const data = {
        name: 'John Doe',
        age: 25,
    };
    const source = '{{name}}, {{name}}, {{name}}';
    const expected = 'John Doe, John Doe, John Doe';

    const result = replaceValues(data, source);

    t.is(result, expected);
});

test('🍎 sha256 should fail if hash values incorrectly', async t => {
    const result = replaceValues(
        { cakeType: 1, cakeExists: false, cakeName: 'testName2' },
        'cakeType: {{sha256 cakeName}}',
    );
    t.assert(
        result !==
            'cakeType: 4278d90b65ee634b960c9e026e4295f8f4fd8d3f29785548552afdc71ef4b495',
    );
});

test('🍏 Handlebars Helper: removeLastChar exists', async t => {
    t.truthy(Handlebars.helpers.removeLastChar);
});

test('🍏 Handlebars Helper: commadelimlist exists', async t => {
    t.truthy(Handlebars.helpers.commadelimlist);
});
