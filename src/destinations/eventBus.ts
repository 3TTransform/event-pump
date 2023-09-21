import { populateEventData, replaceEnvVars } from '../utils';
import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import { sendEvent } from './awstools';

let eventBusClient: EventBridgeClient;

export const eventBusHydrateOne = async (pattern: any, event: unknown) => {
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
