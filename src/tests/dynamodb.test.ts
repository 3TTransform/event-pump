import test from 'ava';
import sinon from 'sinon';
import Dynamo from '../destinations/dynamodb'
import AWS from 'aws-sdk';

const dynamoStub = {
  scan: sinon.stub().returns({promise: ()=>{}}),
  listTables: sinon.stub(),
  putItem: sinon.stub().returns({promise: ()=>{}}),
  getItem: sinon.stub().returns({promise: ()=>{}}),
  updateItem: sinon.stub().returns({promise: ()=>{}}),
  deleteItem: sinon.stub().returns({promise: ()=>{}}),
};

let dynamo;
test.beforeEach(t => {
  dynamo = new Dynamo();
  sinon.stub(dynamo, 'dyn').value(dynamoStub);
});

test.afterEach(t => {
  sinon.restore();
  dynamo = null;
});

test('🍏 generateUpdateQuery should generate the correct update expression', (t) => {
  const fields = {
    name: 'John',
    age: 25,
    address: null,
    email: undefined,
  };
  const expectedExpression = {
    UpdateExpression: 'SET #name = :name, #age = :age, #address = :address',
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
});
test('🍎 generateUpdateQuery should return undefined if fields are either null or undefined', (t) => {
  const nullResult = dynamo.generateUpdateQuery(null);
  const undefinedResult = dynamo.generateUpdateQuery(undefined);

  t.is(nullResult, undefined);
  t.is(undefinedResult, undefined);
});
test('🍎 generateUpdateQuery should handle an empty fields object', (t) => {
  const fields = {};

  const expectedExpression = {
    UpdateExpression: '',
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
  };

  const result = dynamo.generateUpdateQuery(fields);

  t.deepEqual(result, expectedExpression);
});

test('🍏 scanTable should call the scan method with correct parameters', async (t) => {
  const tableName = 'myTable';
  const lastEvaluatedKey = { id: 'lastKey' };

  await dynamo.scanTable(tableName, lastEvaluatedKey);
  t.true(dynamoStub.scan.calledOnce);
  t.deepEqual(dynamoStub.scan.firstCall.args[0], {
    TableName: tableName,
    Limit: 10,
    ExclusiveStartKey: lastEvaluatedKey,
  });
});

test('🍏 dynamodbTableExists should return true when the table exists', async (t) => {
  const tableName = 'myTable';
  const tableNames = ['table1', 'table2', tableName];
  dynamoStub.listTables = sinon.stub().returns( {promise: () => ({ TableNames: tableNames })});

  const result = await dynamo.dynamodbTableExists(tableName);

  t.true(result);
  t.true(dynamoStub.listTables.calledOnce);
});

test('🍎 dynamodbTableExists should return false when the table does not exist', async (t) => {
  const tableName = 'myTable';
  const tableNames = ['table1', 'table2'];
  dynamoStub.listTables = sinon.stub().returns( {promise: () => ({ TableNames: tableNames })});
  const result = await dynamo.dynamodbTableExists(tableName);
  t.false(result);
  t.true(dynamoStub.listTables.calledOnce);
});


test.serial.only('🍏 dynamodbWrite should call putItem method with the provided parameters', async (t) => {
  const params = { TableName: 'myTable', Item: { id: '123', name: 'John Doe' } };
  await dynamo.dynamodbWrite(params);
  t.true(dynamoStub.putItem.calledOnce);
  t.deepEqual(dynamoStub.putItem.firstCall.args[0], params);
});
test.serial.only('🍏 dynamodbGet should call putItem method with the provided parameters', async (t) => {
  const params = { TableName: 'myTable', Item: { id: '123', name: 'John Doe' } };
  await dynamo.dynamodbGet(params);
  t.true(dynamoStub.getItem.calledOnce);
  t.deepEqual(dynamoStub.getItem.firstCall.args[0], params);
});
test.serial.only('🍏 dynamodbUpdate should call putItem method with the provided parameters', async (t) => {
  const params = { TableName: 'myTable', Item: { id: '123', name: 'John Doe' } };
  await dynamo.dynamodbUpdate(params);
  t.true(dynamoStub.updateItem.calledOnce);
  t.deepEqual(dynamoStub.updateItem.firstCall.args[0], params);
});
test.serial.only('🍏 dynamodbDelete should call putItem method with the provided parameters', async (t) => {
  const params = { TableName: 'myTable', Item: { id: '123', name: 'John Doe' } };
  await dynamo.dynamodbDelete(params);
  t.true(dynamoStub.deleteItem.calledOnce);
  t.deepEqual(dynamoStub.deleteItem.firstCall.args[0], params);
});
