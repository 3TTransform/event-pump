require('dotenv').config();

import Dynamo from './destinations/dynamodb';
const ddb = new Dynamo();

import { loadConfig } from './yaml';
import { mssqlHydrateOne } from './destinations/mssql';
import { ionHydrateOne } from './destinations/ion';
import { postgresSqlHydrateOne } from './destinations/postgresSQL';
import { openSearchHydrateOne } from './destinations/openSearch';
import { parseCSV } from './utils';
import fs from 'fs';

// to parse csv files
//import { parse } from '@fast-csv/parse';

export interface CliParams {
    yml: string;
}

const processEvent = async (doc: any, event: any, isFirstEvent = false) => {
    let firstEvent = isFirstEvent;
    for (const pattern of doc.patterns) {
        // for each key and value in the pattern check for matching pattern in the event
        let matched = true;
        if (pattern?.rule) {
            for (const [key, value] of Object.entries(pattern.rule)) {
                if (event[key] !== value) {
                    matched = false;
                }
            }
        }
        if (matched && pattern.action) {
            await doHandler(event, pattern, firstEvent);
            firstEvent = false;
        }
    }
}
const processPage = async (doc: any, events: any[], isFirstEvent = false) => {
    for (const event of events) {
        await processEvent(doc, event, isFirstEvent);
    }
};

async function doHandler(event, pattern, isFirstEvent) {
    //case swtich on the action target
    switch (pattern.action.target) {
    case 'ion':
        await ionHydrateOne(pattern, event, isFirstEvent);
        break;
    case 'dynamodb':
        await ddb.dynamodbHydrateOne(pattern, event, isFirstEvent);
        break;
    case 'mssql':
        await mssqlHydrateOne(pattern, event, isFirstEvent);
        break;
    case 'os':
        await openSearchHydrateOne(pattern, event);
        break;
    case 'postgres':
        await postgresSqlHydrateOne(pattern, event, isFirstEvent);
        break;
    default:
        throw new Error(
            `Action target ${pattern.action.target} is not supported`
        );
    }
}

/**
 * @param { object } params - The command line parameters
 */
export async function processEvents(params: CliParams) {
    console.time('Took in seconds');
    let doc;

    try {
        // load and validate the config file
        doc = await loadConfig(params.yml);
    } catch (e) {
        console.error('YML file is invalid');
        throw e;
    }

    let events = [];
    let isFirstEvent;

    if (!doc.source) {
        throw new Error('No source defined');
    }
    switch (doc.source.type) {
    case 'json':
        events = JSON.parse(fs.readFileSync(doc.source.file, 'utf8'));
        await processPage(doc, events);
        break;
    case 'csv':
        const csvData = fs.readFileSync(doc.source.file, 'utf8');
        const rows = csvData.split('\n');
        const headers = rows[0];
        rows.forEach((row, index) => {
            if (index === 0) {
                return;
            }
            const parsedData = parseCSV(headers, row);
            events.push(parsedData);
        });
        await processPage(doc, events);
        break;
    case 'dynamodb':
        let lastEvaluatedKey;
        isFirstEvent = true;
        do {
            const unmarshaledEvents = await ddb.scanTable(
                doc.source.table,
                lastEvaluatedKey
            );
            if (unmarshaledEvents && unmarshaledEvents.Items) {
                events = unmarshaledEvents.Items.map((item) =>
                    ddb.unmarshall(item)
                );
            }
            await processPage(doc, events, isFirstEvent);
            lastEvaluatedKey = unmarshaledEvents.LastEvaluatedKey;
            isFirstEvent = false;
        } while (lastEvaluatedKey);

        break;
    case 'opensearch':
        const response = await openSearchHydrateOne(doc, null, true);
        const items = response.body.hits.hits;
        items.forEach(function (item) {
            events.push(item._source);
        });
        await processPage(doc, events, isFirstEvent);

        break;    
    default:
        throw new Error(`Source ${doc.source.type} is not supported`);
    }
    console.timeEnd('Took in seconds');
}
