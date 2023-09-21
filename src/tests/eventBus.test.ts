import test from 'ava';
import sinon from 'sinon';

import * as awstools from '../destinations/awstools';
import { eventBusHydrateOne } from '../destinations/eventBus';

let baseEnv;
test.beforeEach(() => {
    baseEnv = { ...process.env };
});
test.afterEach(() => {
    process.env = { ...baseEnv };
    sinon.restore();
});

const testPattern = {
    name: 'Event Bus Example',
    rule: { noun: 'organisation', verb: 'create' },
    action: {
        target: 'event-bus',
        eventBusName: '${EVENT_BUS_ARN}',
        source: '${EVENT_SOURCE}',
        detailType: 'Create Organisation',
        shape: {
            noun: 'organisation',
            verb: 'create',
            id: '{{id}}',
            organisationName: '{{organisationName}}',
        },
    },
};
const testEvent = {
    verb: 'create',
    noun: 'organisation',
    id: '7c464356-374a-4c85-b871-13ed8bd92d46',
    organisationName: 'Momentia',
};

const testOutput = {
    payload: testEvent,
    detailType: testPattern.action.detailType,
    source: process.env.EVENT_SOURCE,
    eventBusName: process.env.EVENT_BUS_ARN,
};

test.serial('🍏 eventBusHydrateOne sends event successfully', async t => {
    const sendEventStub = sinon
        .stub(awstools, 'sendEvent')
        .resolves('Event sent successfully');
    await eventBusHydrateOne(testPattern, testEvent);
    t.true(
        sendEventStub.calledOnce,
        'sendEvent should be called once',
    );

    sendEventStub.restore();
});

test.serial('🍎 eventBusHydrateOne handles sendEvent error', async t => {
    const sendEventStub = sinon
        .stub(awstools, 'sendEvent')
        .rejects(new Error('Send event failed'));

    const error = await t.throwsAsync(() =>
        eventBusHydrateOne(testPattern, testEvent),
    );

    t.true(error instanceof Error, 'Expected an error to be thrown');
    t.is(error.message, 'Send event failed', 'Expected error message to match');

    sendEventStub.restore();
});
