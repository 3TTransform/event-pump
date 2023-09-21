import {
    EventBridgeClient,
    PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';

export const sendEvent = async (
    client: EventBridgeClient,
    payload: Record<string, unknown>[],
    detailType: string,
    source: string,
    eventBusArn?: string,
) => {
    const params = {
        Entries: [
            {
                Detail: JSON.stringify(payload),
                DetailType: detailType,
                Source: source,
                EventBusName: eventBusArn,
            },
        ],
    };
    await client.send(new PutEventsCommand(params));
};

export const invokeLambda = async (
    client: LambdaClient,
    functionName: string,
    payload: unknown,
) => {
    const command = new InvokeCommand({
        FunctionName: functionName,
        Payload: Buffer.from(JSON.stringify(payload)),
    });

    return await client.send(command);
};
