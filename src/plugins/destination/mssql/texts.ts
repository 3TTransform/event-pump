import sql from 'mssql';
import { Key, Item } from '../../../destinations/mssqltools';

export function processTexts(item: Key) {
    let value: any;
    let type: any;
    switch (item.type.toLowerCase()) {
        case 'char': {
            value = String(item.value.substring(0, item.length ?? 100));
            type = sql.Char(item.length ?? 100);
            break;
        }
        case 'nchar': {
            value = String(item.value.substring(0, item.length ?? 100));
            type = sql.NChar(item.length ?? 100);
            break;
        }
        case 'text': {
            value = String(item.value);
            type = sql.Text;
            break;
        }
        case 'ntext': {
            value = String(item.value);
            type = sql.NText;
            break;
        }
        case 'varchar': {
            value = String(item.value.substring(0, item.length ?? 100));
            type = sql.VarChar(item.length ?? 100);
            break;
        }
        case 'nvarchar': {
            value = String(item.value.substring(0, item.length ?? 100));
            type = sql.NVarChar(item.length ?? 100);
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
