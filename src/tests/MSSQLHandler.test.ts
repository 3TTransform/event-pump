import test from 'ava';
import sinon from 'sinon';
import * as mssqltools from '../destinations/mssqltools';
import MSSQLHandler from '../handlers/MSSQLHandler';

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

test.serial(
    '🍏 MSSQLHandler should create object and call runSQL',
    async t => {
        const doc = {
            name: 'Read MSSQL Example',
            source: {
                type: 'mssql',
                connectionString: 'My Connection String',
                sql: 'My SQL Query',
                recordSetIndex: 0,
            },
        };
        const recordsets = [[{ results: 'test' }]];

        runSQLStub = sinon.stub(mssqltools, 'runSQL').resolves({ recordsets });

        const handler = new MSSQLHandler(doc);

        t.truthy(handler);

        const events = [];
        for await (const i of handler.readEvents()) events.push(i);

        t.deepEqual(events, [{ results: 'test' }]);

        t.true(runSQLStub.calledOnce);
    },
);
test.serial(
    '🍏 MSSQLHandler should retrive from specified recordset',
    async t => {
        const doc = {
            name: 'Read MSSQL Example',
            source: {
                type: 'mssql',
                connectionString: 'My Connection String',
                sql: 'My SQL Query',
                recordSetIndex: 1,
            },
        };
        const recordsets = [
            [{ results: 'Not This One' }],
            [{ results: 'test' }],
        ];

        runSQLStub = sinon.stub(mssqltools, 'runSQL').resolves({ recordsets });

        const handler = new MSSQLHandler(doc);

        t.truthy(handler);

        const events = [];
        for await (const i of handler.readEvents()) events.push(i);

        t.deepEqual(events, [{ results: 'test' }]);

        t.true(runSQLStub.calledOnce);
    },
);
test.serial(
    '🍏 MSSQLHandler should retrive from first recordset by default',
    async t => {
        const doc = {
            name: 'Read MSSQL Example',
            source: {
                type: 'mssql',
                connectionString: 'My Connection String',
                sql: 'My SQL Query',
            },
        };
        const recordsets = [
            [{ results: 'test' }],
            [{ results: 'Not This One' }],
        ];

        runSQLStub = sinon.stub(mssqltools, 'runSQL').resolves({ recordsets });

        const handler = new MSSQLHandler(doc);

        t.truthy(handler);

        const events = [];
        for await (const i of handler.readEvents()) events.push(i);

        t.deepEqual(events, [{ results: 'test' }]);

        t.true(runSQLStub.calledOnce);
    },
);
test.serial('🍎 MSSQLHandler should handle SQL errors and clean-up correctly', async t => {
    const fakePoolPromise = {
        close: sinon.stub().resolves(),
    };

    const doc = {
        name: 'Read MSSQL Example',
        source: {
            type: 'mssql',
            connectionString: 'My Connection String',
            sql: 'My SQL Query',
        },
    };

    runSQLStub = sinon
        .stub(mssqltools, 'runSQL')
        .rejects(new Error('My SQL Error'));

    const handler = new MSSQLHandler(doc, fakePoolPromise);

    t.truthy(handler);

    const events = [];
    const error = await t.throwsAsync(async () => {
        for await (const i of handler.readEvents()) events.push(i);
    });

    t.true(error instanceof Error, 'Expected an error to be thrown');

    t.deepEqual(events, []);

    t.true(runSQLStub.calledOnce);
    t.true(fakePoolPromise.close.calledOnce);
});
