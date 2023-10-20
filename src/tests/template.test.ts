import test from 'ava';
import Handlebars from 'handlebars';
import { replaceValues } from '../template';

export const UUID_PATTERN = /^[0-9a-fA-F]{8}-(?:[0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/g;

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
    t.assert(result === 'cakeType: 4278d90b65ee634b960c9e026e4295f8f4fd8d3f29785548552afdc71ef4b495');
});

test('🍏 emailToUuid should convert to UUID correctly', async t => {
    const result = replaceValues(
        { cakeType: 1, cakeExists: false, cakeName: 'testName' },
        'cakeType: {{emailToUUID cakeName}}',
    );
    t.log(result);
    t.assert(result === 'cakeType: 64e16ce1-1f10-5087-acbf-eec022f74bbb');
});

test('🍏 randomUUID should generate a random uuid', async t => {
    const result = replaceValues(
        { cakeType: 1, cakeExists: false, cakeName: 'testName' },
        '{{randomUUID}}',
    );
    t.regex(result, UUID_PATTERN);
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
    t.assert(result !== 'cakeType: 4278d90b65ee634b960c9e026e4295f8f4fd8d3f29785548552afdc71ef4b495');
});

test('🍏 Handlebars Helper: removeLastChar exists', async t => {
    t.truthy(Handlebars.helpers.removeLastChar);
});

test('🍏 Handlebars Helper: commadelimlist exists', async t => {
    t.truthy(Handlebars.helpers.commadelimlist);
});
