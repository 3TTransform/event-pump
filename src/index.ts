import { Dynamo, dynamodbTableCreate } from './destinations/dynamodb';
import fs from 'fs';
import dotenv from 'dotenv';
import CSV from './destinations/csv';

import { loadConfig } from './yaml';
import { mssqlHydrateOne, mssqlTableCreate } from './destinations/mssql';
import { ionHydrateOne } from './destinations/ion';
import {
    postgresSqlHydrateOne,
    postgresSqlTableCreate,
} from './destinations/postgresSQL';
import {
    openSearchHydrateOne,
    openSearchReadPages,
    openSearchIndexCreate,
} from './destinations/openSearch';
import { EPEventSource } from './EPEventSource';

// to parse csv files
//import { parse } from '@fast-csv/parse';

dotenv.config();
const ddb = new Dynamo();

export interface CliParams {
    yml: string;
}

const processEvent = async (doc: any, event: any, isFirstEvent = false) => {
    let firstEvent = isFirstEvent;

    if (!doc.patterns) {
        // if patterns missing, just log results
        console.log(event);
        return;
    }

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
};

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
                `Action target ${pattern.action.target} is not supported`,
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
        if (doc.patterns[0].rule.verb == 'table-create') {
            await createTable(doc.patterns[0].action);
            console.timeEnd('Took in seconds');
            return;
        }
        throw new Error('No source defined');
    }

    switch (doc.source.type) {
        case 'json':
            events = JSON.parse(fs.readFileSync(doc.source.file, 'utf8'));
            await processPage(doc, events);
            break;
        case 'csv':
            {
                const source: EPEventSource = new CSV(doc);
                for await (const event of source.readEvents()) {
                    await processEvent(doc, await event, isFirstEvent);
                    isFirstEvent = false;
                }
            }
            break;
        case 'dynamodb':
            {
                let lastEvaluatedKey;
                isFirstEvent = true;
                do {
                    const unmarshaledEvents = await ddb.scanTable(
                        doc.source.table,
                        lastEvaluatedKey,
                    );
                    if (unmarshaledEvents?.Items) {
                        events = unmarshaledEvents.Items.map(item =>
                            ddb.unmarshall(item),
                        );
                    }
                    await processPage(doc, events, isFirstEvent);
                    lastEvaluatedKey = unmarshaledEvents.LastEvaluatedKey;
                    isFirstEvent = false;
                } while (lastEvaluatedKey);
            }

            break;
        case 'opensearch':
            {
                let count = 0;
                for await (const item of openSearchReadPages(doc)) {
                    await processEvent(doc, item._source, isFirstEvent);
                    isFirstEvent = false;
                    count++;
                }
                console.info(`${count} records processed`);
            }
            break;
        default:
            throw new Error(`Source ${doc.source.type} is not supported`);
    }
    console.timeEnd('Took in seconds');
}

async function createTable(action: any) {
    switch (action.target) {
        case 'mssql':
            await mssqlTableCreate(action.params);
            break;
        case 'dynamodb':
            await dynamodbTableCreate(action.params);
            break;
        case 'opensearch':
            await openSearchIndexCreate(
                action.params.table_name,
                action.params.number_of_shards,
                action.params.number_of_replicas,
            );
            break;
        case 'postgres':
            await postgresSqlTableCreate(action.params);
            break;
        default:
            throw new Error(`Database ${action.target} is not supported`);
    }
}
