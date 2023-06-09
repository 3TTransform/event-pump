import test from 'ava';
import Handlebars from 'handlebars';
import { replaceValues } from '../template';


test('🍏 replaceValues should replace values correctly (1)', async (t) => {
  const result = replaceValues({ cakeType: 1, cakeExists: false },
    'cakeType: {{#removeLastChar}}{{cakeType}}, {{cakeExists}}, {{filling}} {{/removeLastChar}}');
  t.assert(result, 'cakeType: 1, false');
});


test('🍏 replaceValues should replace values correctly (2)', (t) => {
  const data = {
    name: 'John Doe',
    age: 25,
  };
  const source = 'My name is {{name}} and I am {{age}} years old.';
  const expected = 'My name is John Doe and I am 25 years old.';

  const result = replaceValues(data, source);

  t.is(result, expected);
});

test('🍎 replaceValues should handle missing values', (t) => {
  const data = {
    name: 'John Doe',
  };
  const source = 'My name is {{name}} and I am {{age}} years old.';
  const expected = 'My name is John Doe and I am  years old.';

  const result = replaceValues(data, source);

  t.is(result, expected);
});

test('🍎 replaceValues should handle multiple occurrences of the same value', (t) => {
  const data = {
    name: 'John Doe',
    age: 25,
  };
  const source = '{{name}}, {{name}}, {{name}}';
  const expected = 'John Doe, John Doe, John Doe';

  const result = replaceValues(data, source);

  t.is(result, expected);
});

test('🍏 Handlebars Helper: removeLastChar exists', async (t) => {
  t.truthy(Handlebars.helpers.removeLastChar);
});

test('🍏 Handlebars Helper: commadelimlist exists', async (t) => {
  t.truthy(Handlebars.helpers.commadelimlist);
});