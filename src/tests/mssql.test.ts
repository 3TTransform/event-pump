import test from 'ava';
import sinon from 'sinon';
import { mssqlHydrateOne, getProperties } from '../destinations/mssql';

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
const testSQLError = 'THROW 500000, \'Error\', 1';
const inputParams = [
    { name: 'param1', value: 'value1' },
    { name: 'param2', value: 'value2' },
];

test.serial.skip('🍏 mssqlHydrateOne should execute SQL query', async (t) => {
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
test.serial.skip('🍏 mssqlHydrateOne should execute SQL query with parameters', async (t) => {
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

test.serial.skip('🍎 mssqlHydrateOne log an error if input is missing', async (t) => {
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
test.serial.skip('🍎 mssqlHydrateOne should throw an error if parameters are not supplied', async (t) => {
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
test.serial.skip('🍎 mssqlHydrateOne should throw an error if the SQL is not valid', async (t) => {
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

[   {type: 'Bit', value: 1, title: '',},
    {type: 'BigInt', value: 1234567891012345, title: '',},
    {type: 'Decimal', value: 3.4125678, title: '', options: {precision: 10, scale: 4},},
    {type: 'Float', value: 34125678, title: '',},
    {type: 'Int', value: 34125678, title: '',},
    {type: 'Money', value: 4567, title: '', options: {local: 'en-GB',currency: 'GBP'},},
    {type: 'Numeric', value: 4567.578945, title: '', options: {precision: 8, scale: 4},},
    {type: 'SmallInt', value: 4567, title: '',},
    {type: 'SmallMoney', value: 4567, title: '', options: {local: 'en-GB',currency: 'GBP'},},
    {type: 'Real', value: 4567.578945, title: '',},
    {type: 'TinyInt', value: 128, title: '',},
    {type: 'Char', value: 'ABC', title: '',},
    {type: 'Char', value: 'ABCDEFGHIJK', title: ' and limited length', options: {length: 5,},},
    {type: 'NChar', value: 'ABC', title: '',},
    {type: 'NChar', value: 'ABCDEFGHIJK', title: ' and limited length', options: {length: 5,},},
    {type: 'NChar', value: 'AÁBCDEÉFGHIJK', title:', limited length and spacial chars', options: {length: 8,},},
    {type: 'Text', value: 'ABC', title: '',},
    {type: 'Text', value: 'AÁBCDEÉFGHIJK', title: ' and spacial characters',},
    {type: 'NText', value: 'ABC', title: '',},
    {type: 'NText', value: 'AÁBCDEÉFGHIJK', title: ' and spacial characters',},
    {type: 'VarChar', value: 'ABC', title: '',},
    {type: 'VarChar', value: 'ABCDEFGHIJK', title: ' and limited length', options: {length: 5,},},
    {type: 'VarChar', value: 'AÁBCDEÉFGHIJK', title:', limited length and spacial chars', options: {length: 8,},},
    {type: 'NVarChar', value: 'ABC', title: '',},
    {type: 'NVarChar', value: 'ABCDEFGHIJK', title: ' and limited length', options: {length: 5,},},
    {type: 'NVarChar', value: 'AÁBCDEÉFGHIJK', title:', limited length and spacial chars', options: {length: 8,},},
    {type: 'Xml', value: '<strong>Beware of the leopard</strong>', title: '',},
    {type: 'Time', value: '2023-06-12 12:15:00', title: '', options: {scale: 4, format: 'HH-mm-ss',},},
    {type: 'Date', value: '2023-06-12 12:15:00', title: '', options: {format: 'YYYY/MM/DD',},},
    {type: 'DateTime', value: '2023-06-12 12:15:00', title: '', options: {format: 'YYYY/MM/DD HH-mm-ss',},},
    {type: 'DateTime2', value: '2023-06-12 12:15:00', title: '', options: {scale: 4, format: 'YYYY/MM/DD HH-mm-ss:SSSSSS',},},
    //{type: 'DateTimeOffset', value: '2023-06-12 12:15:00', title: '', options: {scale: 4, format: 'YYYY/MM/DD[T]HH:mm:ss.SSSZ',},},
    {type: 'SmallDateTime', value: '2023-06-12 12:15:00', title: '', options: {scale: 4, format: 'YYYY/MM/DD HH:mm:ss',},},
    {type: 'UniqueIdentifier', value: '00000000-0000-0000-0000-000000000000', title: '',},
    // {type: 'Variant', value: '', title: '',},
    {type: 'Binary', value: 'ABC', title: '',},
    {type: 'VarBinary', value: 'ABC', title: '',},
    // {type: 'Image', value: '', title: '',},
    // {type: 'UDT', value: '', title: '',},
    // {type: 'Geography', value: '', title: '',},
    // {type: 'Geometry', value: '', title: '',},
].forEach((field) => {
    test.serial(`🍏 getProperties should return formated input properties with type of "${field.type}${field.title}"`, async (t) => {
        const input = {
            name: 'context',
            type: field.type,
            value: field.value
        };
        if (field.options) {
            for (const [key, value] of Object.entries(field.options)) {
                input[key] = value;
            }
        }
        const response = getProperties(input);
        t.assert(response.type);
        if (field.type == 'BigInt') t.is(BigInt(response.value), BigInt(1234567891012345));
        else if (field.type == 'Decimal') t.is(response.value, '3.4126');
        else if (field.type == 'Money' || field.type == 'SmallMoney' ) t.is(response.value, '£4,567.00');
        else if (field.type == 'Numeric') t.is(response.value, '4567.5789');
        else if (field.type == 'Char' && field.options?.length == 5) t.is(response.value, 'ABCDE');
        else if (field.type == 'NChar' && field.options?.length == 5) t.is(response.value, 'ABCDE');
        else if (field.type == 'NChar' && field.options?.length == 8) t.is(response.value, 'AÁBCDEÉF');
        else if (field.type == 'VarChar' && field.options?.length == 5) t.is(response.value, 'ABCDE');
        else if (field.type == 'VarChar' && field.options?.length == 8) t.is(response.value, 'AÁBCDEÉF');
        else if (field.type == 'NVarChar' && field.options?.length == 5) t.is(response.value, 'ABCDE');
        else if (field.type == 'NVarChar' && field.options?.length == 8) t.is(response.value, 'AÁBCDEÉF');
        else if (field.type == 'Xml') t.is(response.value.documentElement.firstChild.data, 'Beware of the leopard');
        else if (field.type == 'Time')  t.is(response.value, '12-15-00');
        else if (field.type == 'Date')  t.is(response.value, '2023/06/12');
        else if (field.type == 'DateTime')  t.is(response.value, '2023/06/12 12-15-00');
        else if (field.type == 'DateTime2')  t.is(response.value, '2023/06/12 12-15-00:000000');
        else if (field.type == 'DateTimeOffset')  t.is(response.value, '2023/06/12T12:15:00.000+01:00');
        else if (field.type == 'SmallDateTime')  t.is(response.value, '2023/06/12 12:15:00');
        else if (field.type == 'Binary' || field.type == 'VarBinary')  t.is(response.value, '1000001 1000010 1000011 ');
        else t.is(response.value, field.value);
    });
});

[   {type: 'Bit', value: 'ABC', title: '',},
    {type: 'BigInt', value: 'ABC', title: '',},
    {type: 'Decimal', value: 'ABC', title: '', options: {precision: 10, scale: 4}},
    {type: 'Float', value: 'ABC', title: '',},
    {type: 'Int', value: 'ABC', title: '',},
    {type: 'Money', value: 'ABC', title: '', options: {local: 'en-GB',currency: 'GBP'},},
    {type: 'Numeric', value: 'ABC', title: '', options: {precision: 8, scale: 4},},
    {type: 'SmallInt', value: 'ABC', title: '',},
    {type: 'SmallInt', value: -32795, title: ', out of range (-)',},
    {type: 'SmallInt', value: 32780, title: ', out of range (+)',},
    {type: 'SmallMoney', value: 'ABC', title: '',options: {local: 'en-GB',currency: 'GBP'},},
    {type: 'Real', value: 'ABC', title: '',},
    {type: 'TinyInt', value: 'ABC', title: '',},
    {type: 'TinyInt', value: -3, title: ', out of range (-)',},
    {type: 'TinyInt', value: 260, title: ', out of range (+)',},
    {type: 'Xml', value: {any: ''}, title: '',},
    {type: 'Time', value: 'ABC', title: '', options: {scale: 4, format: 'HH-mm-ss',},},
    {type: 'Date', value: 'ABC', title: '', options: {format: 'YYYY/MM/DD',},},
    {type: 'DateTime', value: 'ABC', title: '', options: {format: 'YYYY/MM/DD HH-mm-ss',},},
    {type: 'DateTime2', value: 'ABC', title: '', options: {scale: 4, format: 'YYYY/MM/DD HH-mm-ss:SSSSSS',},},
    // {type: 'DateTimeOffset', value: 'ABC', title: '', options: {scale: 4, format: 'YYYY/MM/DD[T]HH:mm:ss.SSSZ',},},
    {type: 'SmallDateTime', value: 'ABC', title: '', options: {scale: 4, format: 'YYYY/MM/DD HH:mm:ss',},},
    {type: 'UniqueIdentifier', value: '00000000-0000-0000-000000000000', title: '',},
    // {type: 'Variant', value: 'ABC', title: '',},
    {type: 'Binary', value: {any: ''}, title: '',},
    {type: 'VarBinary', value: {any: ''}, title: '',},
    // {type: 'Image', value: '', title: '',},
    // {type: 'UDT', value: '', title: '',},
    // {type: 'Geography', value: '', title: '',},
    // {type: 'Geometry', value: '', title: '',},
].forEach((field) => {
    test.serial(`🍎 getProperties should throw an error when value is not convertible to "${field.type}${field.title}"`, async (t) => {
        const input = {
            name: 'context',
            type: field.type,
            value: field.value
        };
        if (field.options) {
            for (const [key, value] of Object.entries(field.options)) {
                input[key] = value;
            }
        }
        try {
            getProperties(input);
        } catch (e) {
            if (field.type == 'Xml') t.is(e.message, `Convertion of [object Object] to ${field.type} failed`);
            else t.is(e.message, `Convertion of ${field.value} to ${field.type} failed`);
        }  
    });
});