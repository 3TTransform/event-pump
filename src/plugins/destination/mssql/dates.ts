import sql from 'mssql';
import moment from 'moment';
import { Key, Item, conversionFailed } from '../../../destinations/mssqltools';

export function processDates(item: Key) {
    let value: any;
    let type: any;
    switch (item.type.toLowerCase()) {
        case 'time': {
            value = moment(new Date(item.value)).format(
                item.format ?? 'HH:mm:ss',
            );
            type = sql.Time(item.scale ?? 2);
            break;
        }
        case 'date': {
            value = moment(new Date(item.value)).format(
                item.format ?? 'YYYY-MM-DD',
            );
            type = sql.Date;
            break;
        }
        case 'datetime': {
            value = moment(new Date(item.value)).format(
                item.format ?? 'YYYY-MM-DD HH:mm:ss',
            );
            type = sql.DateTime;
            break;
        }
        case 'datetime2': {
            value = moment(new Date(item.value)).format(
                item.format ?? 'YYYY-MM-DD HH:mm:ss.SSSSSS',
            );
            type = sql.DateTime2(item.scale ?? 2);
            break;
        }
        case 'datetimeoffset': {
            value = moment(new Date(item.value)).format(
                item.format ?? 'YYYY-MM-DD[T]HH:mm:ss.SSSZ',
            );
            type = sql.DateTimeOffset(item.scale ?? 2);
            break;
        }
        case 'smalldatetime': {
            value = moment(new Date(item.value)).format(
                item.format ?? 'YYYY-MM-DD HH:mm:ss',
            );
            type = sql.SmallDateTime;
            break;
        }
    }

    if (value == 'Invalid date') {
        conversionFailed(item);
    }
    const properties: Item = {
        name: item.name,
        type,
        value,
    };
    return properties;
}
