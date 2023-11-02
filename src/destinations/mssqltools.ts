import { processDates } from '../plugins/destination/mssql/dates';
import { processNumbers } from '../plugins/destination/mssql/numbers';
import { processTexts } from '../plugins/destination/mssql/texts';
import { processOthers } from '../plugins/destination/mssql/others';
import { processNotConverted } from '../plugins/destination/mssql/notconverted';

export interface Item {
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

export const runSQL = async (poolPromise, sqlCommand, input?) => {
    const poolConnection = await poolPromise.connect();
    const request = await poolConnection.request();

    if (input) {
        for (const key of input) {
            const properties: Item = getProperties(key);
            if (properties.type)
                request.input(
                    properties.name,
                    properties.type,
                    properties.value,
                );
            else request.input(properties.name, properties.value);
        }
    }

    const result = await request.query(sqlCommand);
    poolConnection.close();
    return result;
};

export const getProperties = (item: Key) => {
    try {
        switch (item.type.toLowerCase()) {
            case 'bit':           
            case 'bigint':
            case 'decimal':
            case 'float':
            case 'int':
            case 'numeric':
            case 'smallint':
            case 'real':
            case 'tinyint': 
                return processNumbers(item);
            case 'char':
            case 'nchar':
            case 'text':
            case 'ntext':
            case 'varchar':
            case 'nvarchar': 
                return processTexts(item);
            case 'time':
            case 'date':
            case 'datetime':
            case 'datetime2':
            case 'datetimeoffset':
            case 'smalldatetime': 
                return processDates(item);
            case 'money':
            case 'smallmoney':
            case 'uniqueidentifier':
            case 'binary':
            case 'varbinary': 
                return processOthers(item);
            case 'variant':
            case 'xml':
            case 'image':
            case 'udt':
            case 'geography':
            case 'geometry': 
                return processNotConverted(item);
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
        conversionFailed(item);
        return err;
    }
};

export function stringToBinary(string, maxBytes) {
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

export function conversionFailed(key: Key) {
    throw new Error(`Conversion of ${JSON.stringify(key.value)} to ${JSON.stringify(key.type)} failed`);
}
