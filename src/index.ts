import { Dynamo, dynamodbTableCreate } from './destinations/dynamodb';
import dotenv from 'dotenv';

import { loadConfig } from './yaml';
import { mssqlHydrateOne, mssqlTableCreate } from './destinations/mssql';
import { ionHydrateOne } from './destinations/ion';
import {
    postgresSqlHydrateOne,
    postgresSqlTableCreate,
} from './destinations/postgresSQL';
import {
    openSearchHydrateOne,
    openSearchIndexCreate,
} from './destinations/openSearch';

import { eventBusHydrateOne } from './destinations/eventBus';
import { invokeLambdaHydrateOne } from './destinations/invokeLambda';

import { processCSV } from './plugins/source/csv';
import { processOpensearch } from './plugins/source/opensearch';
import { processDynamoDb } from './plugins/source/dynamo';
import { processJSON } from './plugins/source/json';
import { processMSSQL } from './plugins/source/mssql';

dotenv.config();
const ddb = new Dynamo();

export interface CliParams {
    yml: string;
}

const processEvent = async (doc: any, event: unknown, isFirstEvent = false) => {
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
        case 'event-bus':
            await eventBusHydrateOne(pattern, event);
            break;
        case 'lambda':
            await invokeLambdaHydrateOne(pattern, event);
            break;
        case 'debug-info':
            console.info(event);
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
            await processJSON(doc, processEvent);
            break;
        case 'csv':
            await processCSV(doc, processEvent);
            break;
        case 'dynamodb':
            await processDynamoDb(doc, processEvent);
            break;
        case 'opensearch':
            await processOpensearch(doc, processEvent);
            break;
        case 'mssql':
            await processMSSQL(doc, processEvent, doc.patterns[0].action?.delay);
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
