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

const openSearchHydrateOne = async (pattern: any, event: any, isFirstEvent: boolean) => {

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
    
    switch (pattern.rule.verb) {
    case 'create':
        await osCreate(singleItem, index_name);
        break;
    case 'delete':
        await osDelete(singleItem, index_name);
        break;
    case 'update':
        await osUpdate(singleItem, index_name);
        break;
    case 'search':
        await osSearch(index_name);
        break;
    default:
        throw new Error(
            `Action target ${pattern.action.target} is not supported`
        );
    }
       


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

async function osSearch(index_name: string) {
    // Search for the document.
    // const query = {
    //     query: {
    //         match: {
    //             name: {
    //                 query: 'The Outsider',
    //             },
    //         },
    //     },
    // };

    const query = {
        size: 100, //default 10
        query: {
            match_all: {}
        },
        // sort: [
        //     {
        //         organisationName: {
        //             order: 'desc'
        //         }
        //     }
        // ]
    };    

    const response = await client.search({
        index: index_name,
        body: query,
    });
    //console.log(response.body.hits.hits[0]._source);
    console.log(response.body.hits.hits);
    return response;
}

export { openSearchHydrateOne, osSearch };
