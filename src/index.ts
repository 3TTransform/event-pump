require('dotenv').config();

import Dynamo from './destinations/dynamodb';
const ddb = new Dynamo();

import { loadConfig } from './yaml';
import { mssqlHydrateOne } from './destinations/mssql';
import { ionHydrateOne } from './destinations/ion';
import { postgresSqlHydrateOne } from './destinations/postgresSQL';
import { openSearchHydrateOne } from './destinations/os';
import { parseCSV } from './utils';
import fs from 'fs';

// to parse csv files
//import { parse } from '@fast-csv/parse';

export interface CliParams {
    yml: string;
}

const processPage = async (doc: any, events: any, isFirstEvent = false) => {
    // iterate the events in this set
    for (const event of events) {
        // iterate the events in this file
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
                await doHandler(event, pattern, isFirstEvent);
            }
        }
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
    case 'postgresSQL':
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
        break;
    case 'dynamodb':
        const table = doc.source.table;
        let lastEvaluatedKey;
        isFirstEvent = true;
        do {
            const unmarshaledEvents = await ddb.scanTable(
                table,
                lastEvaluatedKey
            );
            if (unmarshaledEvents && unmarshaledEvents.Items) {
                events = unmarshaledEvents.Items.map((item) =>
                    ddb.unmarshal(item)
                );
            }
            await processPage(doc, events, isFirstEvent);
            lastEvaluatedKey = unmarshaledEvents.LastEvaluatedKey;
            isFirstEvent = false;
        } while (lastEvaluatedKey);

        break;
    default:
      throw new Error(`Source ${doc.source.type} is not supported`);
  }
  console.timeEnd('Took in seconds');
}
