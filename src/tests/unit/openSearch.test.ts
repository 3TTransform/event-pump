import test from 'ava';
import { beforeEach } from 'node:test';
import proxyquire from 'proxyquire';
import sinon from 'sinon';

const osc_index_Stub = sinon.stub().resolves(true);
const osc_update_Stub = sinon.stub().resolves(true);
const osc_delete_Stub = sinon.stub().resolves(true);
const osc_indices_Exists_Stub = sinon.stub().resolves({ body: false });
const osc_indices_Create_Stub = sinon.stub().resolves(true);

const openSearch = proxyquire('../../destinations/openSearch', {
    '@opensearch-project/opensearch': {
        Client: sinon.stub().callsFake(() => ({
            index: osc_index_Stub,
            delete: osc_delete_Stub,
            update: osc_update_Stub,
            indices: {
                exists: osc_indices_Exists_Stub,
                create: osc_indices_Create_Stub,
            },
        })),
    },
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

test.beforeEach(() => {
    osc_index_Stub.resetHistory();
    osc_delete_Stub.resetHistory();
    osc_update_Stub.resetHistory();
    osc_indices_Exists_Stub.resetHistory();
    osc_indices_Create_Stub.resetHistory();
});

test.serial('🍏 openSearchHydrateOne create_item', async t => {
    const pattern = makePattern(
        'organisationCreate',
        'create',
        'a8d215c9-5604-4643-9541-76ce73516109',
        'Frolix',
    );
    const result = await openSearch.openSearchHydrateOne(pattern, 'event');
    t.truthy(result);
    t.true(osc_index_Stub.calledOnce);
    t.true(
        osc_index_Stub.calledOnceWithExactly({
            id: 'a8d215c9-5604-4643-9541-76ce73516109',
            index: 'example',
            body: { organisationName: 'Frolix' },
            refresh: true,
        }),
    );

    t.true(osc_indices_Exists_Stub.calledOnceWithExactly({ index: 'example' }));
});

test.serial('🍏 openSearchHydrateOne create_item 2', async t => {
    const pattern = makePattern(
        'organisationCreate',
        'create',
        '63c0daaa-ddf7-4813-9424-20bc25485257',
        'Progenex',
    );
    const result = await openSearch.openSearchHydrateOne(pattern, 'event');
    t.truthy(result);
    t.true(osc_index_Stub.calledOnce);
    t.true(
        osc_index_Stub.calledOnceWithExactly({
            id: '63c0daaa-ddf7-4813-9424-20bc25485257',
            index: 'example',
            body: { organisationName: 'Progenex' },
            refresh: true,
        }),
    );
});

test.serial('🍏 openSearchHydrateOne update_item', async t => {
    const pattern = makePattern(
        'organisationUpdate',
        'update',
        '63c0daaa-ddf7-4813-9424-20bc25485257',
        'Progenex Ltd.',
    );
    const result = await openSearch.openSearchHydrateOne(pattern, 'event');

    t.true(osc_update_Stub.calledOnce);
    t.true(
        osc_update_Stub.calledOnceWithExactly({
            id: '63c0daaa-ddf7-4813-9424-20bc25485257',
            index: 'example',
            body: { doc: { organisationName: 'Progenex Ltd.' } },
        }),
    );

    t.truthy(result);
});

test.serial('🍏 openSearchHydrateOne delete_item', async t => {
    const pattern = makePattern(
        'organisationDelete',
        'delete',
        'a8d215c9-5604-4643-9541-76ce73516109',
    );
    const result = await openSearch.openSearchHydrateOne(pattern, 'event');

    t.true(osc_delete_Stub.calledOnce);
    t.true(
        osc_delete_Stub.calledOnceWithExactly({
            index: 'example',
            id: 'a8d215c9-5604-4643-9541-76ce73516109',
        }),
    );

    t.truthy(result);
});
