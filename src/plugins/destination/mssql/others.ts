import sql from 'mssql';
import { Key, Item, conversionFailed, stringToBinary } from '../../../destinations/mssqltools';

export function processOthers(item: Key) {
    let value: any;
    let type: any;
    switch (item.type.toLowerCase()) {
        case 'money': {
            const currency = new Intl.NumberFormat(item.local, {
                style: 'currency',
                currency: item.currency,
            });
            value = currency.format(item.value.toFixed(2));
            type = sql.Money;
            break;
        }
        case 'smallmoney': {
            const currency = new Intl.NumberFormat(item.local, {
                style: 'currency',
                currency: item.currency,
            });
            value = currency.format(parseInt(item.value, 10));
            type = sql.SmallMoney;
            break;
        }
        case 'uniqueidentifier': {
            if (item.value) {
                if (
                    /^(\{)?[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}(\})?$/.test(
                        item.value,
                    )
                ) {
                    value = item.value;
                    type = sql.UniqueIdentifier;
                }
                else {
                    conversionFailed(item);
                }                
            }             
            break;
        }
        case 'binary': {
            value = stringToBinary(item.value, 255);
            type = sql.Binary;
            break;
        }
        case 'varbinary': {
            value = stringToBinary(item.value, item.length ?? 65535);
            type = sql.VarBinary(item.length ?? 65535);
            break;
        }
    }
    const properties: Item = {
        name: item.name,
        type,
        value,
    };
    return properties;
}
