import { populateEventData, replaceEnvVars } from '../utils';
import {
    EventBridgeClient,
    PutEventsCommand,
} from '@aws-sdk/client-eventbridge';

let eventBusClient: EventBridgeClient;

export const eventBusHydrateOne = async (pattern: any, event: any) => {
    if (!eventBusClient) {
        eventBusClient = new EventBridgeClient({
            region: process.env.AWS_DEFAULT_REGION || 'us-east-2',
        });
    }

    const payload = populateEventData(event, pattern.action.shape);
    const detailType = replaceEnvVars(pattern.action.detailType);
    const source = replaceEnvVars(pattern.action.source);
    const eventBusName = replaceEnvVars(pattern.action.eventBusName);
    return await sendEvent(
        eventBusClient,
        payload,
        detailType,
        source,
        eventBusName,
    );
};

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
