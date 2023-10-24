import test from 'ava';
import sinon from 'sinon';
import { Dynamo } from '../../destinations/dynamodb';

const dynamoStub = {
    scan: sinon.stub().returns({ promise: () => ({}) }),
    listTables: sinon.stub(),
    putItem: sinon.stub().returns({ promise: () => ({}) }),
    getItem: sinon.stub().returns({ promise: () => ({}) }),
    updateItem: sinon.stub().returns({ promise: () => ({}) }),
    deleteItem: sinon.stub().returns({ promise: () => ({}) }),
};

let dynamo;
test.beforeEach(() => {
    dynamo = new Dynamo();
    sinon.stub(dynamo, 'dyn').value(dynamoStub);
    dynamoStub.scan.resetHistory();
    dynamoStub.listTables.resetHistory();
    dynamoStub.putItem.resetHistory();
    dynamoStub.getItem.resetHistory();
    dynamoStub.updateItem.resetHistory();
    dynamoStub.deleteItem.resetHistory();
});
test.afterEach(() => {
    sinon.restore();
    dynamo = null;
});

const params = { TableName: 'myTable', Item: { id: '123', name: 'John Doe' } };

test.serial(
    '🍏 generateUpdateQuery should generate the correct update expression',
    t => {
        const fields = {
            name: 'John',
            age: 25,
            address: null,
            email: undefined,
        };
        const expectedExpression = {
            UpdateExpression:
                'SET #name = :name, #age = :age, #address = :address',
            ExpressionAttributeNames: {
                '#address': 'address',
                '#age': 'age',
                '#name': 'name',
            },
            ExpressionAttributeValues: {
                ':address': null,
                ':name': 'John',
                ':age': 25,
            },
        };
        const result = dynamo.generateUpdateQuery(fields);
        t.deepEqual(result, expectedExpression);
    },
);
test.serial(
    '🍎 generateUpdateQuery should return undefined if fields are either null or undefined',
    t => {
        const nullResult = dynamo.generateUpdateQuery(null);
        const undefinedResult = dynamo.generateUpdateQuery(undefined);

        t.is(nullResult, undefined);
        t.is(undefinedResult, undefined);
    },
);
test.serial(
    '🍎 generateUpdateQuery should handle an empty fields object',
    t => {
        const fields = {};

        const expectedExpression = {
            UpdateExpression: '',
            ExpressionAttributeNames: {},
            ExpressionAttributeValues: {},
        };

        const result = dynamo.generateUpdateQuery(fields);

        t.deepEqual(result, expectedExpression);
    },
);

test.serial(
    '🍏 scanTable should call the scan method with correct parameters',
    async t => {
        const tableName = 'myTable';
        const lastEvaluatedKey = { id: 'lastKey' };

        await dynamo.scanTable(tableName, lastEvaluatedKey);
        t.true(dynamoStub.scan.calledOnce);
        t.deepEqual(dynamoStub.scan.firstCall.args[0], {
            TableName: tableName,
            Limit: 10,
            ExclusiveStartKey: lastEvaluatedKey,
        });
    },
);

test.serial(
    '🍏 dynamodbTableExists should return true when the table exists',
    async t => {
        const tableName = 'myTable';
        const tableNames = ['table1', 'table2', tableName];
        dynamoStub.listTables = sinon
            .stub()
            .returns({ promise: () => ({ TableNames: tableNames }) });

        const result = await dynamo.dynamodbTableExists(tableName);

        t.true(result);
        t.true(dynamoStub.listTables.calledOnce);
    },
);

test.serial(
    '🍎 dynamodbTableExists should return false when the table does not exist',
    async t => {
        const tableName = 'myTable';
        const tableNames = ['table1', 'table2'];
        dynamoStub.listTables = sinon
            .stub()
            .returns({ promise: () => ({ TableNames: tableNames }) });
        const result = await dynamo.dynamodbTableExists(tableName);
        t.false(result);
        t.true(dynamoStub.listTables.calledOnce);
    },
);

test.serial(
    '🍏 dynamodbWrite should call putItem method with the provided parameters',
    async t => {
        await dynamo.dynamodbWrite(params);
        t.true(dynamoStub.putItem.calledOnce);
        t.deepEqual(dynamoStub.putItem.firstCall.args[0], params);
    },
);
test.serial(
    '🍏 dynamodbGet should call getItem method with the provided parameters',
    async t => {
        await dynamo.dynamodbGet(params);
        t.true(dynamoStub.getItem.calledOnce);
        t.deepEqual(dynamoStub.getItem.firstCall.args[0], params);
    },
);
test.serial(
    '🍏 dynamodbUpdate should call updateItem method with the provided parameters',
    async t => {
        await dynamo.dynamodbUpdate(params);
        t.true(dynamoStub.updateItem.calledOnce);
        t.deepEqual(dynamoStub.updateItem.firstCall.args[0], params);
    },
);
test.serial(
    '🍏 dynamodbDelete should call deleteItem method with the provided parameters',
    async t => {
        await dynamo.dynamodbDelete(params);
        t.true(dynamoStub.deleteItem.calledOnce);
        t.deepEqual(dynamoStub.deleteItem.firstCall.args[0], params);
    },
);

test.serial(
    '🍎 dynamodbHydrateOne should throw an error if the table does not exist',
    async t => {
        dynamoStub.listTables = sinon
            .stub()
            .returns({ promise: () => ({ TableNames: ['table1', 'table2'] }) });
        const pattern = {
            action: {
                params: {
                    TableName: 'nonexistentTable',
                },
                type: 'put',
            },
        };

        await t.throwsAsync(dynamo.dynamodbHydrateOne(pattern, {}, true), {
            message: "Table 'nonexistentTable' does not exist",
        });

        t.true(dynamoStub.listTables.calledOnceWithExactly());
    },
);

test.serial(
    '🍏 dynamodbHydrateOne should call dynamodbWrite method for "put" action type',
    async t => {
        dynamoStub.listTables = sinon
            .stub()
            .returns({ promise: () => ({ TableNames: ['myTable'] }) });
        const pattern = {
            action: {
                params: params,
                type: 'put',
            },
        };
        const event = {
            verb: 'create',
            noun: 'organisation',
            id: '443f12ee-b931-4dfe-ba7d-5ac2f5271f8b',
            organisationName: 'Oceanica',
        };
        const expectedResult = {
            TableName: 'myTable',
            Item: { id: { S: '123' }, name: { S: 'John Doe' } },
        };

        await dynamo.dynamodbHydrateOne(pattern, event, true);

        t.true(dynamoStub.listTables.calledOnceWithExactly());
        t.true(dynamoStub.putItem.calledOnce);
        t.deepEqual(dynamoStub.putItem.firstCall.args[0], expectedResult);
    },
);

test.serial(
    '🍏 dynamodbHydrateOne should call dynamodbUpdate method for "update" action type',
    async t => {
        dynamoStub.listTables = sinon
            .stub()
            .returns({ promise: () => ({ TableNames: ['myTable'] }) });
        const pattern = {
            action: {
                values: {
                    id: '{{id}}',
                    organisationName: '{{organisationName}}',
                },
                params: {
                    TableName: 'myTable',
                    Key: {
                        pk: 'organisation#{{id}}',
                        sk: 'organisation',
                    },
                },
                type: 'update',
            },
        };
        const event = {
            verb: 'update',
            noun: 'organisation',
            id: '443f12ee-b931-4dfe-ba7d-5ac2f5271f8b',
            organisationName: 'Oceanica Ltd.',
        };
        const expectedResult = {
            UpdateExpression:
                'SET #id = :id, #organisationName = :organisationName',
            ExpressionAttributeNames: {
                '#id': 'id',
                '#organisationName': 'organisationName',
            },
            ExpressionAttributeValues: {
                ':id': { S: '443f12ee-b931-4dfe-ba7d-5ac2f5271f8b' },
                ':organisationName': { S: 'Oceanica Ltd.' },
            },
            TableName: 'myTable',
            Key: {
                pk: { S: 'organisation#443f12ee-b931-4dfe-ba7d-5ac2f5271f8b' },
                sk: { S: 'organisation' },
            },
        };

        await dynamo.dynamodbHydrateOne(pattern, event, true);

        t.true(dynamoStub.listTables.calledOnceWithExactly());
        t.true(dynamoStub.updateItem.calledOnce);
        t.deepEqual(dynamoStub.updateItem.firstCall.args[0], expectedResult);
    },
);

test.serial(
    '🍏 dynamodbHydrateOne should call dynamodbDelete method for "delete" action type',
    async t => {
        dynamoStub.listTables = sinon
            .stub()
            .returns({ promise: () => ({ TableNames: ['myTable'] }) });
        const pattern = {
            action: {
                params: params,
                type: 'delete',
            },
        };
        const event = {
            verb: 'delete',
            noun: 'organisation',
            id: 'bf469ba7-4df1-4ba7-9af4-3c1f66322bba',
        };
        const expectedResult = {
            TableName: 'myTable',
            Key: { id: { S: '123' }, name: { S: 'John Doe' } },
        };

        await dynamo.dynamodbHydrateOne(pattern, event, true);

        t.true(dynamoStub.listTables.calledOnceWithExactly());
        t.true(dynamoStub.deleteItem.calledOnce);
        t.deepEqual(dynamoStub.deleteItem.firstCall.args[0], expectedResult);
    },
);
