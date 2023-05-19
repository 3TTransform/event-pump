import test from 'ava';
test('foo', t => { t.pass();});

import { openSearchHydrateOne } from '../destinations/os';

/*
test('🍏 create_index', async (t) => {
    const result = await openSearchHydrateOne('create', 'event', false);
    //console.log(result);
    t.truthy(result);
});

test('🍏 create_item', async (t) => {
    const result = await openSearchHydrateOne('create', 'event', false);
    //console.log(result);
    t.truthy(result);
});

*/
test('🍏 search', async (t) => {

    const pattern = {
        name: 'organisationCreate',
        rule: { verb: 'search' },
        action: { target: 'os', params: { TableName: 'Example', Item: {name: 'Istvan'} } }
    };
    const result = await openSearchHydrateOne(pattern, 'event', false);
    t.pass();
    //t.assert(result.length > 0);
});

/*
test('🍏 delete_item', async (t) => {
    const result = await openSearchHydrateOne('delete', 'event', false);
    //console.log(result);
    t.truthy(result);
});

test('🍏 delete_index', async (t) => {
    const result = await openSearchHydrateOne('delete', 'event', false);
    //console.log(result);
    t.truthy(result);
});
*/
