import { replaceValues } from '../template';
import { populateEventData } from '../utils';
import sql from 'mssql';
import dotenv from 'dotenv';
import moment from 'moment';
import { DOMParser } from 'xmldom';
dotenv.config();

const {
    SQL_SERV: sqlServer,
    SQL_USER: sqlUser,
    SQL_PASS: sqlPassword,
    SQL_DB: sqlDatabase,
} = process.env;

const connectionString = `Data Source=${sqlServer};Initial Catalog=${sqlDatabase};User ID=${sqlUser};Password=${sqlPassword};Connection Timeout=1000;TrustServerCertificate=true;`;

const poolPromise = new sql.ConnectionPool(connectionString);

const runSQL = async (sqlCommand, input) => {
    const poolConnection = await poolPromise.connect();
    const request = await poolConnection.request();

    for (const key of input) {
        const properties: Item = getProperties(key);
        if (properties.type) request.input(properties.name, properties.type, properties.value);
        else request.input(properties.name, properties.value);
    }

    const result = await request.query(sqlCommand);
    poolConnection.close();
    return result;
};

export const mssqlHydrateOne = async (
    pattern: any,
    event: any,
    isFirstEvent: boolean
) => {
    const populatedParameters = populateEventData(
        event,
        pattern.action.params.input
    );

    let replacedSQL = replaceValues(event, pattern.action.params.sql);
    replacedSQL = replacedSQL.replace(/,\s*WHERE/g, ' WHERE');
    try {
        await runSQL(replacedSQL, populatedParameters);
    } catch (err) {
        console.info(`${event.id} failed ${err.message}`);
    }
};

export const getProperties = (item: Key) => {
    try {
        switch (item.type.toLowerCase()) {
        case 'bit': {
            const parsed = +item.value;
            if (isNaN(parsed))
            {
                throw new Error(`Convertion of ${item.value} to ${item.type} failed`);
            }
            return {
                name: item.name,
                type: sql.Bit,
                value: parsed,
            };
        }
        case 'bigint': {
            const properties: Item = {
                name: item.name,
                type: sql.BigInt,
                value: BigInt(item.value),
            };
            return properties;
        }
        case 'decimal': {
            const properties: Item = {
                name: item.name,
                type: sql.Decimal(item.precision ?? 10, item.scale ?? 2),
                value: item.value.toFixed(item.scale ?? 2),
            };
            return properties;
        }
        case 'float': {
            const parsed = parseFloat(item.value);
            const properties: Item = {
                name: item.name,
                type: sql.Float,
                value: parsed,
            };
            if (!isNaN(parsed)) return properties;
            else convertionFailed(item);
            break;
        }
        case 'int': {
            const parsed = parseInt(item.value);
            const properties: Item = {
                name: item.name,
                type: sql.Int,
                value: parsed,
            };
            if (!isNaN(parsed)) return properties;
            else convertionFailed(item);
            break;
        }
        case 'money': {
            const currency = new Intl.NumberFormat(item.local, {
                style: 'currency',
                currency: item.currency,
            });
            const properties: Item = {
                name: item.name,
                type: sql.Money,
                value: currency.format(item.value.toFixed(2)),
            };
            return properties;
        }
        case 'numeric': {
            const properties: Item = {
                name: item.name,
                type: sql.Numeric(item.precision ?? 10, item.scale ?? 2),
                value: item.value.toFixed(item.scale ?? 2),
            };
            return properties;
        }
        case 'smallint': {
            const parsed = parseInt(item.value);
            const properties: Item = {
                name: item.name,
                type: sql.SmallInt,
                value: parsed,
            };
            if (!isNaN(parsed) && parsed > -32769 && parsed < 32768) return properties;
            else convertionFailed(item);
            break;
        }
        case 'smallmoney': {
            const currency = new Intl.NumberFormat(item.local, {
                style: 'currency',
                currency: item.currency,
            });
            const parsed = parseInt(item.value, 10);
            const properties: Item = {
                name: item.name,
                type: sql.SmallMoney,
                value: currency.format(parsed),
            };
            if (!isNaN(parsed)) return properties;
            else convertionFailed(item);
            break;
        }
        case 'real': {
            const parsed = parseFloat(item.value);
            const properties: Item = {
                name: item.name,
                type: sql.Real,
                value: parsed,
            };
            if (!isNaN(parsed)) return properties;
            else convertionFailed(item);
            break;
        }
        case 'tinyint': {
            const parsed = parseInt(item.value);
            const properties: Item = {
                name: item.name,
                type: sql.TinyInt,
                value: parsed,
            };
            if (!isNaN(parsed) && parsed > -1 && parsed < 256) return properties;
            else convertionFailed(item);
            break;
        }
        case 'char': {
            const properties: Item = {
                name: item.name,
                type: sql.Char(item.length ?? 100),
                value: String(item.value.substring(0,item.length ?? 100)),
            };
            return properties;
        }
        case 'nchar': {
            const properties: Item = {
                name: item.name,
                type: sql.NChar(item.length ?? 100),
                value: String(item.value.substring(0,item.length ?? 100)),
            };
            return properties;
        }
        case 'text': {
            const properties: Item = {
                name: item.name,
                type: sql.Text,
                value: String(item.value),
            };
            return properties;
        }
        case 'ntext': {
            const properties: Item = {
                name: item.name,
                type: sql.NText,
                value: String(item.value),
            };
            return properties;
        }
        case 'varchar': {
            const properties = {
                name: item.name,
                type: sql.VarChar(item.length ?? 100),
                value: String(item.value.substring(0,item.length ?? 100)),
            };

            return properties;
        }
        case 'nvarchar': {
            const properties: Item = {
                name: item.name,
                type: sql.NVarChar(item.length ?? 100),
                value: String(item.value.substring(0,item.length ?? 100)),
            };
            return properties;
        }
        case 'xml': {
            const parsed = new DOMParser().parseFromString(
                item.value,
                'text/xml'
            );
            const properties: Item = {
                name: item.name,
                type: sql.Xml,
                value: parsed,
            };
            if (parsed) return properties;
            else convertionFailed(item);
            break;
        }
        case 'time': {
            const parsed = moment(new Date(item.value)).format(
                item.format ?? 'HH:mm:ss'
            );
            const properties: Item = {
                name: item.name,
                type: sql.Time(item.scale ?? 2),
                value: parsed,
            };
            if (parsed != 'Invalid date') return properties;
            else convertionFailed(item);
            break;
        }
        case 'date': {
            const parsed = moment(new Date(item.value)).format(
                item.format ?? 'YYYY-MM-DD'
            );
            const properties: Item = {
                name: item.name,
                type: sql.Date,
                value: parsed,
            };
            if (parsed != 'Invalid date') return properties;
            else convertionFailed(item);
            break;
        }
        case 'datetime': {
            const parsed = moment(new Date(item.value)).format(
                item.format ?? 'YYYY-MM-DD HH:mm:ss'
            );
            const properties: Item = {
                name: item.name,
                type: sql.DateTime,
                value: parsed,
            };
            if (parsed != 'Invalid date') return properties;
            else convertionFailed(item);
            break;
        }
        case 'datetime2': {
            const parsed = moment(new Date(item.value)).format(
                item.format ?? 'YYYY-MM-DD HH:mm:ss.SSSSSS'
            );
            const properties: Item = {
                name: item.name,
                type: sql.DateTime2(item.scale ?? 2),
                value: parsed,
            };
            if (parsed != 'Invalid date') return properties;
            else convertionFailed(item);
            break;
        }
        case 'datetimeoffset': {
            const parsed = moment(new Date(item.value)).format(
                item.format ?? 'YYYY-MM-DD[T]HH:mm:ss.SSSZ'
            );
            const properties: Item = {
                name: item.name,
                type: sql.DateTimeOffset(item.scale ?? 2),
                value: parsed,
            };
            if (parsed != 'Invalid date') return properties;
            else convertionFailed(item);
            break;
        }
        case 'smalldatetime': {
            const parsed = moment(new Date(item.value)).format(
                item.format ?? 'YYYY-MM-DD HH:mm:ss'
            );
            const properties: Item = {
                name: item.name,
                type: sql.SmallDateTime,
                value: parsed,
            };
            if (parsed != 'Invalid date') return properties;
            else convertionFailed(item);
            break;
        }
        case 'uniqueidentifier': {
            if (item.value) {
                if ((/^(\{)?[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}(\})?$/).test(item.value)) {
                    const properties: Item = {
                        name: item.name,
                        type: sql.UniqueIdentifier,
                        value: item.value,
                    };
                    return properties;
                }
            }
            convertionFailed(item);
            break;
        }
        case 'variant': { // We don't convert this type
            const properties: Item = {
                name: item.name,
                type: sql.Variant,
                value: item.value,
            };
            return properties;
        }
        case 'binary': {
            const properties: Item = {
                name: item.name,
                type: sql.Binary,
                value: stringToBinary(item.value, 255),
            };
            return properties;
        }
        case 'varbinary': {
            const properties: Item = {
                name: item.name,
                type: sql.VarBinary(item.length ?? 65535),
                value: stringToBinary(item.value, item.length ?? 65535),
            };
            return properties;
        }
        case 'image': { // We don't convert this type
            const properties: Item = {
                name: item.name,
                type: sql.Image,
                value: item.value, 
            };
            return properties;
        }
        case 'udt': { // We don't convert this type
            const properties: Item = {
                name: item.name,
                type: sql.UDT,
                value: item.value, 
            };
            return properties;
        }
        case 'geography': { // We don't convert this type
            const properties: Item = {
                name: item.name,
                type: sql.Geography,
                value: item.value, 
            };
            return properties;
        }
        case 'geometry': { // We don't convert this type
            const properties: Item = {
                name: item.name,
                type: sql.Geometry,
                value: item.value, 
            };
            return properties;
        }
        default: {
            const properties: Item = {
                name: item.name,
                type: null,
                value: item.value,
            };
            return properties;
        }
        }
    } catch (err) {
        convertionFailed(item);
        return err;
    }
};

function stringToBinary(string, maxBytes) {
    //for BINARY maxBytes = 255
    //for VARBINARY maxBytes = 65535
    let binaryOutput = '';
    if (string.length > maxBytes) {
        string = string.substring(0, maxBytes);
    }

    for (const element of string) {
        binaryOutput += element.charCodeAt(0).toString(2) + ' ';
    }

    return binaryOutput;
}

function convertionFailed(key: Key) {
    throw new Error(`Convertion of ${key.value} to ${key.type} failed`);
}

interface Item {
    name: string;
    value: any;
    type: any;
}

export interface Key {
    name: string;
    value: any;
    type?: string;
    length?: number;
    precision?: number;
    scale?: number;
    local?: string;
    currency?: string;
    format?: string;
}
