import { openSearchHydrateOne } from '../destinations/openSearch';
import test from 'ava';
test('🍏 JSON to OpenSearch', t => {
    t.pass();
});

const makePattern = (
    name: string,
    verb: string,
    orgId: string,
    orgName: string = undefined,
) => ({
    name: name,
    rule: { verb: verb },
    action: {
        target: 'os',
        params: {
            TableName: 'Example',
            Item: {
                id: orgId,
                organisationName: orgName,
            },
        },
    },
});

test.skip('🍏 create_item', async t => {
    const pattern = makePattern(
        'organisationCreate',
        'create',
        'a8d215c9-5604-4643-9541-76ce73516109',
        'Frolix',
    );
    const result = await openSearchHydrateOne(pattern, 'event');
    t.truthy(result);
});

test.skip('🍏 create_item 2', async t => {
    const pattern = makePattern(
        'organisationCreate',
        'create',
        '63c0daaa-ddf7-4813-9424-20bc25485257',
        'Progenex',
    );
    const result = await openSearchHydrateOne(pattern, 'event');
    t.truthy(result);
});

test.skip('🍏 update_item', async t => {
    const pattern = makePattern(
        'organisationUpdate',
        'update',
        '63c0daaa-ddf7-4813-9424-20bc25485257',
        'Progenex Ltd.',
    );
    const result = await openSearchHydrateOne(pattern, 'event');
    t.truthy(result);
});

test.skip('🍏 delete_item', async t => {
    const pattern = makePattern(
        'organisationDelete',
        'delete',
        'a8d215c9-5604-4643-9541-76ce73516109',
    );
    const result = await openSearchHydrateOne(pattern, 'event');
    t.truthy(result);
});
