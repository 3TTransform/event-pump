// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import { Client } from '@opensearch-project/opensearch';
import { populateEventData } from '../utils';

const { 
    OS_URL: osURL, 
    OS_USER: osUser, 
    OS_PASS: osPassword 
} = process.env;
const protocol = 'https';

const client = new Client({
    node: protocol + '://' + osUser + ':' + osPassword + '@' + osURL,
    // use_ssl: true,
});

const openSearchHydrateOne = async (pattern: any, event: any) => {

    const singleItem = populateEventData(event, pattern.action.params.Item);
    const index_name = pattern.action.params.TableName?.toLowerCase();    

    if (!index_name) {
        console.log('OS: table name missing');
        return;
    }
    
    if (!(await client.indices.exists({index: index_name })).body)
    {
        // create index
        await osCreateIndex(index_name);
    }

    let response: any;
    
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
    case 'search':
        response = await osSearch(index_name, pattern.action.params);        
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

async function osCreateIndex(index_name: string) {
    // Create an index with non-default settings
    const settings = {
        settings: {
            index: {
                number_of_shards: 1,  //4
                number_of_replicas: 0,  //3
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
    
    return await client.update({
        id: singleItem.id,
        index: index_name,
        body: {
            doc: document
        }
    });
}

async function osSearch(index_name: string, params: any) {

    let query = {};

    if (params.Value) {
        // Search for the document.
        query = {
            query: {
                match: {
                    [params.Key]: {
                        query: params.Value,
                    },
                },
            },
        };
    }
    else {
        query = {
            'size': params.Size, //default 10
            'query': {
                'match_all': {}
            },
            'sort': [
                {
                    [params.Keyword + '.keyword']: {
                        'order': params.Order
                    }
                }
            ]
        }; 
    }

    const response = await client.search({
        index: index_name,
        body: query,
    });
    //console.log(response.body.hits.hits[0]._source);
    //console.log(response.body.hits.hits);
    return response;
}

export { openSearchHydrateOne, osSearch };
