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


test.serial('🍏 getProperties should return formated input properties with type of "Bit"', async (t) => {
    const input = {
        name: 'context',
        type: 'BIT',
        value: '1'
    };
    const response = getProperties(input);
    t.assert(response.type);
    t.is(response.value, 1);
});

test.serial('🍎 getProperties should throw an error when value is not convertible to "Bit"', async (t) => {
    const input = {
        name: 'context',
        type: 'BIT',
        value: 'ABC'
    };
    try {
        getProperties(input);
    } catch (e) {
        t.is(e.message, 'Convertion of ABC to BIT failed');
    }    
});

test.serial('🍏 getProperties should return formated input properties with type of "BigInt"', async (t) => {
    const input = {
        name: 'context',
        type: 'BIGINT',
        value: '1234567891012345'
    };
    const response = getProperties(input);
    t.assert(response.type);
    t.is(BigInt(response.value), BigInt(1234567891012345));
});

test.serial('🍎 getProperties should throw an error when value is not convertible to "BigInt"', async (t) => {
    const input = {
        name: 'context',
        type: 'BIGINT',
        value: 'ABC'
    };
    try {
        getProperties(input);
    } catch (e) {
        t.is(e.message, 'Convertion of ABC to BIGINT failed');
    }    
});

test.serial('🍏 getProperties should return formated input properties with type of "Decimal"', async (t) => {
    const input = {
        name: 'context',
        type: 'DECIMAL',
        precision: 10,
        scale: 4,
        value: 3.4125678
    };
    const response = getProperties(input);
    t.assert(response.type);
    t.is(response.value, '3.4126');
});

test.serial('🍎 getProperties should throw an error when value is not convertible to "Decimal"', async (t) => {
    const input = {
        name: 'context',
        type: 'DECIMAL',
        value: 'ABC'
    };
    try {
        getProperties(input);
    } catch (e) {
        t.is(e.message, 'Convertion of ABC to DECIMAL failed');
    }    
});

test.serial('🍏 getProperties should return formated input properties with type of "Float"', async (t) => {
    const input = {
        name: 'context',
        type: 'FLOAT',
        value: 34125678
    };
    const response = getProperties(input);
    t.assert(response.type);
    t.is(response.value, 34125678);
});

test.serial('🍎 getProperties should throw an error when value is not convertible to "Float"', async (t) => {
    const input = {
        name: 'context',
        type: 'FLOAT',
        value: 'ABC'
    };
    try {
        getProperties(input);
    } catch (e) {
        t.is(e.message, 'Convertion of ABC to FLOAT failed');
    }    
});

test.serial('🍏 getProperties should return formated input properties with type of "Int"', async (t) => {
    const input = {
        name: 'context',
        type: 'INT',
        value: 12345678
    };
    const response = getProperties(input);
    t.assert(response.type);
    t.is(response.value, 12345678);
});

test.serial('🍎 getProperties should throw an error when value is not convertible to "Int"', async (t) => {
    const input = {
        name: 'context',
        type: 'INT',
        value: 'ABC'
    };
    try {
        getProperties(input);
    } catch (e) {
        t.is(e.message, 'Convertion of ABC to INT failed');
    }    
});

test.serial('🍏 getProperties should return formated input properties with type of "Money"', async (t) => {
    const input = {
        name: 'context',
        type: 'MONEY',
        value: 4567,
        local: 'en-GB',
        currency: 'GBP'
    };
    const response = getProperties(input);
    t.assert(response.type);
    t.is(response.value, '£4,567.00');
});

test.serial('🍎 getProperties should throw an error when value is not convertible to "Money"', async (t) => {
    const input = {
        name: 'context',
        type: 'MONEY',
        value: 'ABC',
        local: 'en-GB',
        currency: 'GBP'
    };
    try {
        getProperties(input);
    } catch (e) {
        t.is(e.message, 'Convertion of ABC to MONEY failed');
   
    }
});

test.serial('🍏 getProperties should return formated input properties with type of "Numeric"', async (t) => {
    const input = {
        name: 'context',
        type: 'NUMERIC',
        value: 4567.578945,
        precision: 8,
        scale: 4
    };
    const response = getProperties(input);
    t.assert(response.type);
    t.is(response.value, '4567.5789');
});

test.serial('🍎 getProperties should throw an error when value is not convertible to "Numeric"', async (t) => {
    const input = {
        name: 'context',
        type: 'NUMERIC',
        value: 'ABC',
        precision: 8,
        scale: 4
    };
    try {
        getProperties(input);
    } catch (e) {
        t.is(e.message, 'Convertion of ABC to NUMERIC failed');
   
    }
});

test.serial('🍏 getProperties should return formated input properties with type of "SmallInt"', async (t) => {
    const input = {
        name: 'context',
        type: 'SMALLINT',
        value: 4567,
    };
    const response = getProperties(input);
    t.assert(response.type);
    t.is(response.value, 4567);
});

test.serial('🍎 getProperties should throw an error when value is not convertible to "SmallInt"', async (t) => {
    const input = {
        name: 'context',
        type: 'SMALLINT',
        value: 'ABC',
    };
    try {
        getProperties(input);
    } catch (e) {
        t.is(e.message, 'Convertion of ABC to SMALLINT failed');
   
    }
});

test.serial('🍎 getProperties should throw an error when value is out of range (-) for "SmallInt"', async (t) => {
    const input = {
        name: 'context',
        type: 'SMALLINT',
        value: -32795,
    };
    try {
        getProperties(input);
    } catch (e) {
        t.is(e.message, 'Convertion of -32795 to SMALLINT failed');
   
    }
});

test.serial('🍎 getProperties should throw an error when value is out of range (+) for "SmallInt"', async (t) => {
    const input = {
        name: 'context',
        type: 'SMALLINT',
        value: 32780,
    };
    try {
        getProperties(input);
    } catch (e) {
        t.is(e.message, 'Convertion of 32780 to SMALLINT failed');
   
    }
});

test.serial('🍏 getProperties should return formated input properties with type of "SmallMoney"', async (t) => {
    const input = {
        name: 'context',
        type: 'SMALLMONEY',
        value: 4567,
        local: 'en-GB',
        currency: 'GBP'
    };
    const response = getProperties(input);
    t.assert(response.type);
    t.is(response.value, '£4,567.00');
});

test.serial('🍎 getProperties should throw an error when value is not convertible to "SmallMoney"', async (t) => {
    const input = {
        name: 'context',
        type: 'SMALLMONEY',
        value: 'ABC',
        local: 'en-GB',
        currency: 'GBP'
    };
    try {
        getProperties(input);
    } catch (e) {
        t.is(e.message, 'Convertion of ABC to SMALLMONEY failed');
   
    }
});

test.serial('🍏 getProperties should return formated input properties with type of "Real"', async (t) => {
    const input = {
        name: 'context',
        type: 'REAL',
        value: 4567.578945,
    };
    const response = getProperties(input);
    t.assert(response.type);
    t.is(response.value, 4567.578945);
});

test.serial('🍎 getProperties should throw an error when value is not convertible to "Real"', async (t) => {
    const input = {
        name: 'context',
        type: 'REAL',
        value: 'ABC',
    };
    try {
        getProperties(input);
    } catch (e) {
        t.is(e.message, 'Convertion of ABC to REAL failed');
   
    }
});

test.serial('🍏 getProperties should return formated input properties with type of "TinyInt"', async (t) => {
    const input = {
        name: 'context',
        type: 'TINYINT',
        value: 128,
    };
    const response = getProperties(input);
    t.assert(response.type);
    t.is(response.value, 128);
});

test.serial('🍎 getProperties should throw an error when value is not convertible to "TinyInt"', async (t) => {
    const input = {
        name: 'context',
        type: 'TINYINT',
        value: 'ABC',
    };
    try {
        getProperties(input);
    } catch (e) {
        t.is(e.message, 'Convertion of ABC to TINYINT failed');
   
    }
});

test.serial('🍎 getProperties should throw an error when value is out of range (-) for "TinyInt"', async (t) => {
    const input = {
        name: 'context',
        type: 'TINYINT',
        value: -3,
    };
    try {
        getProperties(input);
    } catch (e) {
        t.is(e.message, 'Convertion of -3 to TINYINT failed');
   
    }
});

test.serial('🍎 getProperties should throw an error when value is out of range (+) for "TinyInt"', async (t) => {
    const input = {
        name: 'context',
        type: 'TINYINT',
        value: 260,
    };
    try {
        getProperties(input);
    } catch (e) {
        t.is(e.message, 'Convertion of 260 to TINYINT failed');
   
    }
});

test.serial('🍏 getProperties should return formated input properties with type of "Char"', async (t) => {
    const input = {
        name: 'context',
        type: 'CHAR',
        value: 'ABC',
    };
    const response = getProperties(input);
    t.assert(response.type);
    t.is(response.value, 'ABC');
});

test.serial('🍏 getProperties should return formated input properties with type of "Char" with limited length of text', async (t) => {
    const input = {
        name: 'context',
        type: 'CHAR',
        value: 'ABCDEFGHIJK',
        length: 5
    };
    const response = getProperties(input);
    t.assert(response.type);
    t.is(response.value, 'ABCDE');
});

test.serial('🍏 getProperties should return formated input properties with type of "NChar"', async (t) => {
    const input = {
        name: 'context',
        type: 'NCHAR',
        value: 'ABC',
    };
    const response = getProperties(input);
    t.assert(response.type);
    t.is(response.value, 'ABC');
});

test.serial('🍏 getProperties should return formated input properties with type of "NChar" with limited length of text', async (t) => {
    const input = {
        name: 'context',
        type: 'NCHAR',
        value: 'ABCDEFGHIJK',
        length: 5
    };
    const response = getProperties(input);
    t.assert(response.type);
    t.is(response.value, 'ABCDE');
});

test.serial('🍏 getProperties should return formated input properties with type of "NChar" with scpecial chars', async (t) => {
    const input = {
        name: 'context',
        type: 'NCHAR',
        value: 'AÁBCDEÉFGHIJK',
        length: 8
    };
    const response = getProperties(input);
    t.assert(response.type);
    t.is(response.value, 'AÁBCDEÉF');
});

test.serial('🍏 getProperties should return formated input properties with type of "Text"', async (t) => {
    const input = {
        name: 'context',
        type: 'TEXT',
        value: 'ABC',
    };
    const response = getProperties(input);
    t.assert(response.type);
    t.is(response.value, 'ABC');
});

test.serial('🍏 getProperties should return formated input properties with type of "Text" with scpecial chars', async (t) => {
    const input = {
        name: 'context',
        type: 'TEXT',
        value: 'AÁBCDEÉFGHIJK',
    };
    const response = getProperties(input);
    t.assert(response.type);
    t.is(response.value, 'AÁBCDEÉFGHIJK');
});

test.serial('🍏 getProperties should return formated input properties with type of "NText"', async (t) => {
    const input = {
        name: 'context',
        type: 'NTEXT',
        value: 'ABC',
    };
    const response = getProperties(input);
    t.assert(response.type);
    t.is(response.value, 'ABC');
});

test.serial('🍏 getProperties should return formated input properties with type of "NText" with scpecial chars', async (t) => {
    const input = {
        name: 'context',
        type: 'NTEXT',
        value: 'AÁBCDEÉFGHIJK',
    };
    const response = getProperties(input);
    t.assert(response.type);
    t.is(response.value, 'AÁBCDEÉFGHIJK');
});

test.serial('🍏 getProperties should return formated input properties with type of "VarChar"', async (t) => {
    const input = {
        name: 'context',
        type: 'VARCHAR',
        value: 'ABC',
    };
    const response = getProperties(input);
    t.assert(response.type);
    t.is(response.value, 'ABC');
});

test.serial('🍏 getProperties should return formated input properties with type of "VarChar" with limited length of text', async (t) => {
    const input = {
        name: 'context',
        type: 'VARCHAR',
        value: 'ABCDEFGHIJK',
        length: 5
    };
    const response = getProperties(input);
    t.assert(response.type);
    t.is(response.value, 'ABCDE');
});

test.serial('🍏 getProperties should return formated input properties with type of "VarChar" with scpecial chars', async (t) => {
    const input = {
        name: 'context',
        type: 'VARCHAR',
        value: 'AÁBCDEÉFGHIJK',
    };
    const response = getProperties(input);
    t.assert(response.type);
    t.is(response.value, 'AÁBCDEÉFGHIJK');
});

test.serial('🍏 getProperties should return formated input properties with type of "NVarChar"', async (t) => {
    const input = {
        name: 'context',
        type: 'NVARCHAR',
        value: 'ABC',
    };
    const response = getProperties(input);
    t.assert(response.type);
    t.is(response.value, 'ABC');
});

test.serial('🍏 getProperties should return formated input properties with type of "NVarChar" with limited length of text', async (t) => {
    const input = {
        name: 'context',
        type: 'NVARCHAR',
        value: 'ABCDEFGHIJK',
        length: 5
    };
    const response = getProperties(input);
    t.assert(response.type);
    t.is(response.value, 'ABCDE');
});

test.serial('🍏 getProperties should return formated input properties with type of "NVarChar" with scpecial chars', async (t) => {
    const input = {
        name: 'context',
        type: 'NVARCHAR',
        value: 'AÁBCDEÉFGHIJK',
    };
    const response = getProperties(input);
    t.assert(response.type);
    t.is(response.value, 'AÁBCDEÉFGHIJK');
});

test.serial('🍏 getProperties should return formated input properties with type of "Xml"', async (t) => {
    const input = {
        name: 'context',
        type: 'XML',
        value: '<strong>Beware of the leopard</strong>',
    };
    const response = getProperties(input);
    t.assert(response.type);
    t.is(response.value.documentElement.firstChild.data, 'Beware of the leopard');
});

test.serial('🍎 getProperties should throw an error when value is not convertible to "Xml"', async (t) => {
    const input = {
        name: 'context',
        type: 'XML',
        value: {any: ''},
    };
    try {
        getProperties(input);
    } catch (e) {
        t.is(e.message, 'Convertion of [object Object] to XML failed');
   
    }
});