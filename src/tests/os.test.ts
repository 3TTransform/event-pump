import test from 'ava';
test('🍏 JSON to OpenSearch', t => { t.pass();});

import { openSearchHydrateOne } from '../destinations/os';

/*
test('🍏 create_index', async (t) => {
	const pattern = {
        name: 'organisationCreate',
        rule: { verb: 'search' },
        action: { target: 'os', params: { TableName: 'Example', Size: 100, Keyword: 'organisationName', Order: 'desc'}}
    };
    const result = await openSearchHydrateOne('create', 'event');
    t.truthy(result);
});
*/

test('🍏 create_item', async (t) => {

    const pattern = {
        name: 'organisationCreate',
        rule: { verb: 'create' },
        action: { target: 'os', params: { TableName: 'Example', Item: { id: 'a8d215c9-5604-4643-9541-76ce73516109', organisationName: 'Frolix' }}}
    };
    const result = await openSearchHydrateOne(pattern, 'event');
    t.truthy(result);
});

test('🍏 create_item 2', async (t) => {

    const pattern = {
        name: 'organisationCreate',
        rule: { verb: 'create' },
        action: { target: 'os', params: { TableName: 'Example', Item: { id: '63c0daaa-ddf7-4813-9424-20bc25485257', organisationName: 'Progenex' }}}
    };
    const result = await openSearchHydrateOne(pattern, 'event');
    t.truthy(result);
});

test('🍏 basic search', async (t) => {

    const pattern = {
        name: 'organisationCreate',
        rule: { verb: 'search' },
        action: { target: 'os', params: { TableName: 'Example', Size: 100, Keyword: 'organisationName', Order: 'desc'}}
    };
    const result = await openSearchHydrateOne(pattern, 'event');
    t.assert(result.body.hits.hits.length > 0);
});

test('🍏 name search', async (t) => {

    const pattern = {
        name: 'organisationCreate',
        rule: { verb: 'search' },
        action: { target: 'os', params: { TableName: 'Example', Key: 'organisationName', Value: 'Cytrex'}}
    };
    const result = await openSearchHydrateOne(pattern, 'event');
    t.assert(result.body.hits.hits.length > 0);
});

test('🍏 update_item', async (t) => {

    const pattern = {
        name: 'organisationCreate',
        rule: { verb: 'update' },
        action: { target: 'os', params: { TableName: 'Example', Item: { id: '63c0daaa-ddf7-4813-9424-20bc25485257', organisationName: 'Progenex Ltd.' }}}
    };
    const result = await openSearchHydrateOne(pattern, 'event');
    t.truthy(result);
});


test('🍏 delete_item', async (t) => {

    const pattern = {
        name: 'organisationCreate',
        rule: { verb: 'delete' },
        action: { target: 'os', params: { TableName: 'Example', Item: { id: 'a8d215c9-5604-4643-9541-76ce73516109' }}}
    };
    const result = await openSearchHydrateOne(pattern, 'event');
    t.truthy(result);
});

/*
test('🍏 delete_index', async (t) => {
    const result = await openSearchHydrateOne('delete', 'event');
    //console.log(result);
    t.truthy(result);
});
*/