import test from 'ava';
import sinon from 'sinon';

import * as awstools from '../destinations/awstools';
import { invokeLambdaHydrateOne } from '../destinations/invokeLambda';

let baseEnv;
test.beforeEach(() => {
    baseEnv = { ...process.env };
});
test.afterEach(() => {
    process.env = { ...baseEnv };
    sinon.restore();
});

const testPattern = {
    name: 'Lambda Example',
    rule: { noun: 'organisation', verb: 'create' },
    action: {
        target: 'lambda',
        functionName: '${LAMBDA_ARN}',
        shape: {
            DetailType: 'Create Organisation',
            Source: 'source',
            Detail: {
                noun: 'organisation',
                verb: 'create',
                organisationId: '{{id}}',
                name: '{{organisationName}}',
            },
        },
        response: { type: 'PASS', path: 'success', equalTo: true },
    },
};
const testEvent = {
    verb: 'create',
    noun: 'organisation',
    id: '7c464356-374a-4c85-b871-13ed8bd92d46',
    organisationName: 'Momentia',
};
const testOutput = {
    functionName: process.env.LAMBDA_ARN,
    payload: {
        DetailType: testPattern.action.shape.DetailType,
        Source: testPattern.action.shape.Source,
        Detail: testEvent,
    },
};

test.serial('🍏 invokeLambdaHydrateOne sends event successfully', async t => {
    const invokeLambdaStub = sinon
        .stub(awstools, 'invokeLambda')
        .resolves('Event sent successfully');
    await invokeLambdaHydrateOne(testPattern, testEvent);
    t.true(invokeLambdaStub.calledOnce, 'sendEvent should be called once');

    invokeLambdaStub.restore();
});

test.serial('🍎 invokeLambdaHydrateOne handles invokeLambda error', async t => {
    const invokeLambdaStub = sinon
        .stub(awstools, 'invokeLambda')
        .rejects(new Error('Send event failed'));

    const error = await t.throwsAsync(() =>
        invokeLambdaHydrateOne(testPattern, testEvent),
    );

    t.true(error instanceof Error, 'Expected an error to be thrown');
    t.is(error.message, 'Send event failed', 'Expected error message to match');

    invokeLambdaStub.restore();
});
