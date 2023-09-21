import test from 'ava';
import sinon from 'sinon';
import { mssqlHydrateOne } from '../destinations/mssql';
import * as mssqltools from '../destinations/mssqltools';

const testSQL = 'SELECT 1, 2';
const testParmsSQL = 'SELECT @Param1, @Param2';
const inputParams = [
    { name: 'param1', value: 'value1' },
    { name: 'param2', value: 'value2' },
];

let consoleLogStub;
let runSQLStub;

test.beforeEach(() => {
    sinon.restore();
    consoleLogStub = sinon.stub(console, 'info');
});
test.afterEach(() => {
    sinon.restore();
    consoleLogStub.restore();
    runSQLStub.restore();
});

test.serial('🍏 mssqlHydrateOne should execute SQL query', async t => {
    runSQLStub = sinon.stub(mssqltools, 'runSQL').resolves('Query Results');
    const pattern = {
        action: {
            params: {
                input: [],
                sql: testSQL,
            },
        },
    };
    const event = {
        id: '12345',
    };
    const isFirstEvent = true;
    await mssqlHydrateOne(pattern, event, isFirstEvent);
    t.true(runSQLStub.calledOnce);
    t.true(consoleLogStub.notCalled);
});
test.serial(
    '🍏 mssqlHydrateOne should execute SQL query with parameters',
    async t => {
        runSQLStub = sinon.stub(mssqltools, 'runSQL').resolves('Query Results');
        const pattern = {
            action: {
                params: {
                    input: inputParams,
                    sql: testParmsSQL,
                },
            },
        };
        const event = {
            id: '12345',
        };
        const isFirstEvent = true;
        await mssqlHydrateOne(pattern, event, isFirstEvent);
        t.true(runSQLStub.calledOnce);
        t.true(consoleLogStub.notCalled);
    },
);

test.serial(
    '🍎 mssqlHydrateOne log an error from runSQL',
    async t => {
        runSQLStub = sinon.stub(mssqltools, 'runSQL').rejects(new Error ('SQL Error'));
        const pattern = {
            action: {
                params: {
                    sql: testSQL,
                },
            },
        };
        const event = {
            id: '12345',
        };
        const isFirstEvent = true;
        await mssqlHydrateOne(pattern, event, isFirstEvent);
        t.true(runSQLStub.calledOnce);
        t.true(consoleLogStub.called);
    },
);
