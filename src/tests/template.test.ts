import test from 'ava';
import Handlebars from 'handlebars';
import { replaceValues } from '../template';


test('🍏 replaceValues', async (t) => {
    const result = replaceValues( {cakeType: 1,cakeExists: false},
        'cakeType: {{#removeLastChar}}{{cakeType}}, {{cakeExists}}, {{filling}} {{/removeLastChar}}');
    t.assert(result, 'cakeType: 1, false');
});

test('🍏 removeLastChar exists', async (t) => {
    t.truthy(Handlebars.helpers.removeLastChar);
});

test('🍏 commadelimlist exists', async (t) => {
    t.truthy(Handlebars.helpers.commadelimlist);
});