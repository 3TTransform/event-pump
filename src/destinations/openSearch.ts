// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import { Client } from '@opensearch-project/opensearch';
import { populateEventData } from '../utils';

const {
    OS_URL: osURL,
    OS_USER: osUser,
    OS_PASS: osPassword,
    OS_CERTIFICATE: osCertificate
} = process.env;
const protocol = 'https';

const client = new Client({
    node: protocol + '://' + osUser + ':' + osPassword + '@' + osURL,
    ssl: osCertificate ? { ca: osCertificate } : undefined
});

const openSearchReadPages = async function* (pattern: any) {
    const size = pattern.source.size ?? 10000;
    //console.log(JSON.stringify(pattern.source.get.query));
    const scroll = '1m';
    let response = await client.search({
        index: pattern.source.table,
        scroll,
        body: {
            query: pattern.source.get.query
        },
        size,
    });
    let scroll_id = response.body._scroll_id;

    try {
        while (response.body.hits.hits.length > 0) {
            yield* response.body.hits.hits;

            response = await client.scroll({
                scroll,
                scroll_id
            });
            scroll_id = response.body._scroll_id;
        }
    }
    finally {
        await client.clearScroll({
            scroll_id: scroll_id
        });
    }
};

const openSearchHydrateOne = async (pattern: any, event: any) => {

    let response: any;

    const singleItem = populateEventData(event, pattern.action?.params.Item);
    const index_name = pattern.action.params.TableName?.toLowerCase();

    if (!index_name) {
        console.log('OS: table name missing');
        return;
    }

    if (!(await client.indices.exists({ index: index_name })).body) {
        // create index
        await openSearchIndexCreate(index_name);
    }

    switch (pattern.rule.verb) {
    case 'create':
        response = await osCreate(singleItem, index_name);
        break;
    case 'delete':
        response = await osDelete(singleItem, index_name);
        break;
    case 'update':
        response = await osUpdate(singleItem, index_name);
        break;
    default:
        throw new Error(
            `Action target ${pattern.action.target} is not supported`
        );
    }

    if (response) return response;
    return null;
};

async function osCreate(singleItem: any, index_name: string) {
    const document = {};

    for (const [key, value] of Object.entries(singleItem)) {
        if (key != 'id') {
            document[key] = value;
        }
    }

    return await client.index({
        id: singleItem.id,
        index: index_name,
        body: document,
        refresh: true,
    });
}

async function openSearchIndexCreate(
    index_name: string,
    number_of_shards = 1,
    number_of_replicas = 0) {
    // Create an index with non-default settings
    const settings = {
        settings: {
            index: {
                number_of_shards,  //4
                number_of_replicas,  //3
            },
        },
    };

    return await client.indices.create({
        index: index_name,
        body: settings,
    });
}

async function osDelete(singleItem: any, index_name: string) {
    // Delete the document.
    const response = await client.delete({
        index: index_name,
        id: singleItem.id,
    });

    return response;
}

async function osDeleteIndex(singleItem: any, index_name: string) {
    // Delete the index.
    const response = await client.indices.delete({
        index: index_name,
    });

    console.log('Deleting index:');
    console.log(response.body);

    return response;
}

async function osUpdate(singleItem: any, index_name: string) {
    const document = {};

    for (const [key, value] of Object.entries(singleItem)) {
        if (key != 'id') {
            document[key] = value;
        }
    }

    const response = await client.update({
        id: singleItem.id,
        index: index_name,
        body: {
            doc: document
        }
    });

    return response;
}


export { openSearchReadPages, openSearchHydrateOne, openSearchIndexCreate};
