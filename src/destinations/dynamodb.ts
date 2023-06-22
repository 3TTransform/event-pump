import {
    DeleteItemInput,
    PutItemInput,
    GetItemInput,
    UpdateItemInput,
} from 'aws-sdk/clients/dynamodb';
import { populateEventData } from '../utils';

const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.AWS_DEFAULT_REGION || 'us-east-2' });

class Dynamo {
    dyn: any;
    constructor() {
    // allow local endpoints by specifying the ENDPOINT_OVERRIDE variable like this:
    // export ENDPOINT_OVERRIDE=http://localhost:8000
    // export AWS_DEFAULT_REGION=us-east-2
        const serviceConfigOptions: any = {};
        if (process.env.ENDPOINT_OVERRIDE) {
            serviceConfigOptions.endpoint = process.env.ENDPOINT_OVERRIDE;
            serviceConfigOptions.region =
        process.env.AWS_DEFAULT_REGION || 'us-east-2';
        }

        this.dyn = new AWS.DynamoDB(serviceConfigOptions);
    }
    generateUpdateQuery = (fields: any): any => {
    // take in an object and delete verything that is null
        if (fields) {
            Object.keys(fields).forEach((key) => {
                if (fields[key] === undefined) {
                    delete fields[key];
                }
            });

            if (Object.keys(fields).length > 0) {
                return {
                    UpdateExpression: 'SET ' + Object.entries(fields).map(x => `#${x[0]} = :${x[0]}`).join(', '),
                    ExpressionAttributeNames: Object.fromEntries(Object.entries(fields).map(x => [`#${x[0]}`, x[0]])),
                    ExpressionAttributeValues: Object.fromEntries(Object.entries(fields).map(x => [`:${x[0]}`, x[1]])),
                };
            }

            return {
                UpdateExpression: '',
                ExpressionAttributeNames: {},
                ExpressionAttributeValues: {},
            };
        }
    };
    marshall = (item) => {
        return AWS.DynamoDB.Converter.marshall(item);
    };
    unmarshall = (item) => {
        return AWS.DynamoDB.Converter.unmarshall(item);
    };
    scanTable = async (tableName: string, lastEvaluatedKey: any = null) => {
        return await this.dyn
            .scan({
                TableName: tableName,
                Limit: 10,
                ExclusiveStartKey: lastEvaluatedKey,
            })
            .promise();
    };

    dynamodbTableExists = async (tableName: string) => {
        const data = await this.dyn.listTables().promise();
        if (data.TableNames) {
            if (data.TableNames.includes(tableName)) {
                return true;
            }
        }
        return false;
    };
    dynamodbWrite = async (params: PutItemInput) => {
        return await this.dyn.putItem(params).promise();
    };
    dynamodbGet = async (params: GetItemInput) => {
        return await this.dyn.getItem(params).promise();
    };
    dynamodbUpdate = async (params: UpdateItemInput) => {
        return await this.dyn.updateItem(params).promise();
    };
    dynamodbDelete = async (params: DeleteItemInput) => {
        return await this.dyn.deleteItem(params).promise();
    };
    dynamodbHydrateOne = async (
        pattern: any,
        event: any,
        isFirstEvent: boolean
    ) => {
    // check that the table in this action exists before we action on it
        if (!(await this.dynamodbTableExists(pattern.action.params.TableName))) {
            throw new Error(
                `Table '${pattern.action.params.TableName}' does not exist`
            );
        }

        const thisActionType = pattern.action.type;

        if (thisActionType === 'put') {
            const singleItem = populateEventData(event, pattern.action.params.Item);
            const newItem = this.marshall(singleItem);
            const params = { ...pattern.action.params };
            params.Item = newItem;

            await this.dynamodbWrite(params);
        }
        if (thisActionType === 'update') {
            const singleItem = populateEventData(event, pattern.action);
            const updateQuery = this.generateUpdateQuery(singleItem.values);
            updateQuery.TableName = pattern.action.params.TableName;
            updateQuery.Key = this.marshall(singleItem.params.Key);
            updateQuery.ExpressionAttributeValues = this.marshall(
                updateQuery.ExpressionAttributeValues
            );
            await this.dynamodbUpdate(updateQuery);
        }
        if (thisActionType === 'delete') {
            const singleItem = populateEventData(event, pattern.action.params.Item);
            const newItem = this.marshall(singleItem);
            const params = { ...pattern.action.params };
            params.Item = newItem;

            params.Key = params.Item;
            delete params.Item;
            await this.dynamodbDelete(params);
        }
    };

}

const dynamodbTableCreate = async (
    action: any,
) => {
    const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
    ddb.createTable(action, function(err, data) {
        if (err) {
            console.log('Error', err);
        } else {
            console.log('Table Created', data);
        }
    });
};

export {
    Dynamo,
    dynamodbTableCreate
};
