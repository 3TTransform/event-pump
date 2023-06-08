import { replaceValues } from '../template';
import { populateEventData } from '../utils';
import sql from 'mssql';
import dotenv from 'dotenv';
import moment from 'moment';
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
        const properties: item = getProperties(key);
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

function getProperties(item: key) {
    try {
        switch (item.type.toLowerCase()) {
        case 'bit': {
            const properties: item = {
                name: item.name,
                type: sql.Bit,
                value: +item.value,
            };
            return properties;
        }
        case 'bigint': {
            const properties: item = {
                name: item.name,
                type: sql.BigInt,
                value: BigInt(item.value),
            };
            return properties;
        }
        case 'decimal': {
            const properties: item = {
                name: item.name,
                type: sql.Decimal(item.precision ?? 10, item.scale ?? 2),
                value: item.value.toFixed(item.scale ?? 2),
            };
            return properties;
        }
        case 'float': {
            const properties: item = {
                name: item.name,
                type: sql.Float,
                value: parseFloat(item.value),
            };
            return properties;
        }
        case 'int': {
            const properties: item = {
                name: item.name,
                type: sql.Int,
                value: parseInt(item.value),
            };
            return properties;
        }
        case 'money': {
            const properties: item = {
                name: item.name,
                type: sql.Money,
                value: item.value.toLocaleString(item.local, {
                    style: 'currency',
                    currency: item.currency,
                }),
            };
            return properties;
        }
        case 'numeric': {
            const properties: item = {
                name: item.name,
                type: sql.Numeric(item.precision ?? 10, item.scale ?? 2),
                value: item.value.toFixed(item.scale ?? 2),
            };
            return properties;
        }
        case 'smallint': {
            const properties: item = {
                name: item.name,
                type: sql.SmallInt,
                value: parseInt(item.value),
            };
            return properties;
        }
        case 'smallmoney': {
            const properties: item = {
                name: item.name,
                type: sql.SmallMoney,
                value: parseInt(item.value, 10).toLocaleString(item.local, {
                    style: 'currency',
                    currency: item.currency,
                }),
            };
            return properties;
        }
        case 'real': {
            const properties: item = {
                name: item.name,
                type: sql.Real,
                value: parseFloat(item.value),
            };
            return properties;
        }
        case 'tinyint': {
            const properties: item = {
                name: item.name,
                type: sql.TinyInt,
                value: parseInt(item.value),
            };
            return properties;
        }
        case 'char': {
            const properties: item = {
                name: item.name,
                type: sql.Char(item.length ?? 100),
                value: String(item.value),
            };
            return properties;
        }
        case 'nchar': {
            const properties: item = {
                name: item.name,
                type: sql.NChar(item.length ?? 100),
                value: String(item.value),
            };
            return properties;
        }
        case 'text': {
            const properties: item = {
                name: item.name,
                type: sql.Text,
                value: String(item.value),
            };
            return properties;
        }
        case 'ntext': {
            const properties: item = {
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
                value: String(item.value),
            };
            return properties;
        }
        case 'nvarchar': {
            const properties: item = {
                name: item.name,
                type: sql.NVarChar(item.length ?? 100),
                value: String(item.value),
            };
            return properties;
        }
        case 'xml': {
            const properties: item = {
                name: item.name,
                type: sql.Xml,
                value: new DOMParser().parseFromString(
                    item.value,
                    'text/xml'
                ),
            };
            return properties;
        }
        case 'time': {
            const properties: item = {
                name: item.name,
                type: sql.Time(item.scale ?? 2),
                value: moment(new Date(item.value)).format(
                    item.format ?? 'HH:mm:ss'
                ),
            };
            return properties;
        }
        case 'date': {
            const properties: item = {
                name: item.name,
                type: sql.Date,
                value: moment(new Date(item.value)).format(
                    item.format ?? 'YYYY-MM-DD'
                ),
            };
            return properties;
        }
        case 'datetime': {
            const properties: item = {
                name: item.name,
                type: sql.DateTime,
                value: moment(new Date(item.value)).format(
                    item.format ?? 'YYYY-MM-DD HH:mm:ss'
                ),
            };
            return properties;
        }
        case 'datetime2': {
            const properties: item = {
                name: item.name,
                type: sql.DateTime2(item.scale ?? 2),
                value: moment(new Date(item.value)).format(
                    item.format ?? 'YYYY-MM-DD HH:mm:ss.SSSSSS'
                ),
            };
            return properties;
        }
        case 'datetimeoffset': {
            const properties: item = {
                name: item.name,
                type: sql.DateTimeOffset(item.scale ?? 2),
                value: moment(new Date(item.value)).format(
                    item.format ?? 'YYYY-MM-DD[T]HH:mm:ss.SSSZ'
                ),
            };
            return properties;
        }
        case 'smalldatetime': {
            const properties: item = {
                name: item.name,
                type: sql.SmallDateTime,
                value: moment(new Date(item.value)).format(
                    item.format ?? 'YYYY-MM-DD HH:mm:ss'
                ),
            };
            return properties;
        }
        case 'uniqueidentifier': {
            const properties: item = {
                name: item.name,
                type: sql.UniqueIdentifier,
                value: item.value.replace(
                    /([0-z]{8})([0-z]{4})([0-z]{4})([0-z]{4})([0-z]{12})/,
                    '$1-$2-$3-$4-$5'
                ),
            };
            return properties;
        }
        case 'variant': {
            const properties: item = {
                name: item.name,
                type: sql.Variant,
                value: item.value, // Have to check!!!
            };
            return properties;
        }
        case 'binary': {
            const properties: item = {
                name: item.name,
                type: sql.Binary,
                value: stringToBinary(item.value, 255),
            };
            return properties;
        }
        case 'varbinary': {
            const properties: item = {
                name: item.name,
                type: sql.VarBinary(item.length ?? 65535),
                value: stringToBinary(item.value, item.length ?? 65535),
            };
            return properties;
        }
        case 'image': {
            const properties: item = {
                name: item.name,
                type: sql.Image,
                value: item.value, // Have to check!!!
            };
            return properties;
        }
        case 'udt': {
            const properties: item = {
                name: item.name,
                type: sql.UDT,
                value: item.value, // Have to check!!!
            };
            return properties;
        }
        case 'geography': {
            const properties: item = {
                name: item.name,
                type: sql.Geography,
                value: item.value, // Have to check!!!
            };
            return properties;
        }
        case 'geometry': {
            const properties: item = {
                name: item.name,
                type: sql.Geometry,
                value: item.value, // Have to check!!!
            };
            return properties;
        }
        default: {
            const properties: item = {
                name: item.name,
                type: null,
                value: item.value,
            };
            return properties;
        }
        }
    } catch (err) {
        convertionFailed(item);
    }

    return null;
}

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

function convertionFailed(key: key) {
    throw new Error(`Convertion of ${key.value} to ${key.type} failed`);
}

interface item {
    name: string;
    value: any;
    type: any;
}

interface key {
    name: string;
    value: any;
    type: string;
    length: number;
    precision: number;
    scale: number;
    local: string;
    currency: string;
    format: string;
}
