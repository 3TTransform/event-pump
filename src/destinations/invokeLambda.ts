import { LambdaClient } from '@aws-sdk/client-lambda';
import { getProp, populateEventData, replaceEnvVars } from '../utils';
import { invokeLambda } from './awstools';

let lambdaClient: LambdaClient;

export const invokeLambdaHydrateOne = async (pattern: any, event: unknown) => {
    if (!lambdaClient) {
        lambdaClient = new LambdaClient({
            region: process.env.AWS_DEFAULT_REGION || 'us-east-2',
        });
    }
    const payload = populateEventData(event, pattern.action.shape);

    const functionName = replaceEnvVars(pattern.action.functionName);

    const lambdaResponse = await invokeLambda(
        lambdaClient,
        functionName,
        payload,
    );

    if (pattern.action.response?.type === 'JSON') {
        const result = JSON.parse(
            Buffer.from(lambdaResponse.Payload).toString(),
        );
        const value = getProp(result, pattern.action.response.path) ?? true;
        if (
            pattern.action.response.equalTo &&
            pattern.action.response.equalTo == value
        ) {
            return lambdaResponse;
        }
        throw new Error(`Lambda invocation Failed: ${JSON.stringify(result)}`);
    } else if (pattern.action.response?.type === 'PASS') {
        return true;
    } else if (pattern.action.response?.type === 'LOG') {
        console.info(Buffer.from(lambdaResponse.Payload).toString());
        return true;
    }

    throw new Error('Lambda invokcation Failed: Could not resolve response');
};
