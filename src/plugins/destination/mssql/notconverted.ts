import sql from 'mssql';
import { Key, Item } from '../../../destinations/mssqltools';

export function processNotConverted(item: Key) {
    let type: any;
    switch (item.type.toLowerCase()) {
        case 'variant': {
            type = sql.Varian;
            break;
        }
        case 'xml': {
            type = sql.Xml;
            break;
        }
        case 'image': {
            type = sql.Image;
            break;
        }
        case 'udt': {
            type = sql.UDT;
            break;
        }
        case 'geography': {
            type = sql.Geography;
            break;
        }
        case 'geometry': {
            type = sql.Geometry;
            break;
        }
    }
    const properties: Item = {
        name: item.name,
        type,
        value: item.value,
    };
    return properties;
}
