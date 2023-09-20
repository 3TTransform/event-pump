import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { populateEventData, replaceEnvVars } from '../utils';

let lambdaClient1: LambdaClient;

export const invokeLambdaHydrateOne = async (
    pattern: any,
    event: any,
) => {
    if (!lambdaClient1) {
        lambdaClient1 = new LambdaClient({
            region: process.env.AWS_DEFAULT_REGION || 'us-east-2',
        });
    }
    const payload = populateEventData(event, pattern.action.shape);

    const functionName = replaceEnvVars(pattern.action.functionName);
    return await invokeLambda(lambdaClient1, functionName, payload);
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

    await client.send(command);
};

