import test from 'ava';
import sinon from 'sinon';

import { sendEvent, invokeLambda } from '../destinations/awstools';
import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import { LambdaClient } from '@aws-sdk/client-lambda';

const mockEBClient = {
    send: sinon.stub().resolves(),
};
const mockILClient = {
    send: sinon.stub().resolves(),
};
const testPayload = { payloadContent: 'My Payload Content' };

test.serial('🍏 sendEvent passes data to the client', async t => {
    await sendEvent(
        mockEBClient as EventBridgeClient,
        [testPayload],
        'My Detail Type',
        'My Source',
        'My EventBus',
    );
    t.deepEqual(mockEBClient?.send?.firstCall?.args[0]?.input?.Entries[0], {
        Detail: '[{"payloadContent":"My Payload Content"}]',
        DetailType: 'My Detail Type',
        Source: 'My Source',
        EventBusName: 'My EventBus',
    });
});

test.serial('🍏 invokeLambda passes data to the client', async t => {
    await invokeLambda(mockILClient as LambdaClient, 'My Lambda Function', testPayload);
    t.deepEqual(mockILClient?.send?.firstCall?.args[0]?.input, {
        FunctionName: 'My Lambda Function',
        Payload: Buffer.from(JSON.stringify(testPayload)),
    });
});
