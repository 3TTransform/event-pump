import sql from 'mssql';
import { Key, Item, conversionFailed } from '../../../destinations/mssqltools';

export function processNumbers(item: Key) {
    let value: any;
    let type: any;
    switch (item.type.toLowerCase()) {
        case 'bit': {
            value = +item.value;
            type = sql.Bit;
            break;
        }
        case 'bigint': {
            value = BigInt(item.value);
            type = sql.BigInt;
            break;
        }
        case 'decimal': {
            value = item.value.toFixed(item.scale ?? 2);
            type = sql.Decimal(item.precision ?? 10, item.scale ?? 2);
            break;
        }
        case 'float': {
            value = parseFloat(item.value);
            type = sql.Float;
            break;
        }
        case 'int': {
            value = parseInt(item.value);
            type = sql.Int;
            break;
        }
        case 'numeric': {
            value = item.value.toFixed(item.scale ?? 2);
            type = sql.Numeric(item.precision ?? 10, item.scale ?? 2);
            break;
        }
        case 'smallint': {
            value = parseInt(item.value);
            type = sql.SmallInt;
            if (value < -32769 || value > 32768) {
                conversionFailed(item);
            }
            break;
        }
        case 'real': {
            value = parseFloat(item.value);
            type = sql.Real;
            break;
        }
        case 'tinyint': {
            value = parseInt(item.value);
            type = sql.TinyInt;
            if (value < -1 || value > 256) {
                conversionFailed(item);
            }
            break;
        }
    }
    if (item.type.toLowerCase() != 'bigint' && isNaN(value)) {
        conversionFailed(item);
    }
    const properties: Item = {
        name: item.name,
        type,
        value,
    };
    return properties;
}
