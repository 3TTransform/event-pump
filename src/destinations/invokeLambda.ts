import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { getProp, populateEventData, replaceEnvVars } from '../utils';

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

    const lambdaResponse = await invokeLambda(lambdaClient1, functionName, payload);

    if (pattern.action.response?.type === 'JSON')
    {
        const result = JSON.parse(Buffer.from(lambdaResponse.Payload).toString());
        const value = getProp(result, pattern.action.response.path) ?? true;
        if (pattern.action.response.equalTo && pattern.action.response.equalTo == value)
        {
            return lambdaResponse;
        }
        throw new Error(`Lambda invocation Failed: ${JSON.stringify(result)}`);
    }
    else if (pattern.action.response?.type === 'PASS')
    {
        return true;
    }
    else if (pattern.action.response?.type === 'LOG')
    {
        console.info(Buffer.from(lambdaResponse.Payload).toString());
        return true;
    }

    throw new Error('Lambda invokcation Failed: Could not resolve response');

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