import test from 'ava';
import sinon from 'sinon';
import { mssqlHydrateOne } from '../destinations/mssql';

let consoleLogStub;
test.beforeEach(() => {
    sinon.restore();
    consoleLogStub = sinon.stub(console, 'info');
});
test.afterEach(() => {
    sinon.restore();
    consoleLogStub.restore();
});

const testSQL = 'SELECT 1, 2';
const testParmsSQL = 'SELECT @Param1, @Param2';
const testSQLError = `THROW 500000, 'Error', 1`;
const inputParams = [
    { name: 'param1', value: 'value1' },
    { name: 'param2', value: 'value2' },
];

test.serial('🍏 mssqlHydrateOne should execute SQL query', async (t) => {
    const pattern = {
        action: {
            params: {
                input: [],
                sql: testSQL
            },
        },
    };
    const event = {
        id: '12345',
    };
    const isFirstEvent = true;
    await mssqlHydrateOne(pattern, event, isFirstEvent);
    t.true(consoleLogStub.notCalled);
});
test.serial('🍏 mssqlHydrateOne should execute SQL query with parameters', async (t) => {
    const pattern = {
        action: {
            params: {
                input: inputParams,
                sql: testParmsSQL
            },
        },
    };
    const event = {
        id: '12345',
    };
    const isFirstEvent = true;
    await mssqlHydrateOne(pattern, event, isFirstEvent);
    t.true(consoleLogStub.notCalled);
});

test.serial('🍎 mssqlHydrateOne log an error if input is missing', async (t) => {
    const pattern = {
        action: {
            params: {
                sql: testSQL
            },
        },
    };
    const event = {
        id: '12345',
    };
    const isFirstEvent = true;
    await mssqlHydrateOne(pattern, event, isFirstEvent);
    t.true(consoleLogStub.called);
});
test.serial('🍎 mssqlHydrateOne should log an error if parameters are not supplied', async (t) => {
    const pattern = {
        action: {
            params: {
                input: [],
                sql: testParmsSQL
            },
        },
    };
    const event = {
        id: '12345',
    };
    const isFirstEvent = true;
    await mssqlHydrateOne(pattern, event, isFirstEvent);
    t.true(consoleLogStub.called);
});
test.serial('🍎 mssqlHydrateOne should log an error if the SQL is not valid', async (t) => {
    const pattern = {
        action: {
            params: {
                input: [],
                sql: testSQLError
            },
        },
    };
    const event = {
        id: '12345',
    };
    const isFirstEvent = true;
    await mssqlHydrateOne(pattern, event, isFirstEvent);
    t.true(consoleLogStub.called);
});
