// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import { Client } from '@opensearch-project/opensearch';

const { 
    OS_URL: osURL, 
    OS_USER: osUser, 
    OS_PASS: osPassword 
} = process.env;
const protocol = 'https';

const handler = async (pattern: any, event: any) => {
    const client = new Client({
        node: protocol + '://' + osUser + ':' + osPassword + '@' + osURL,
        // use_ssl: true,
    });

    console.log(pattern);
    console.log(event);

    const index_name = 'not_books';
    const id = '2';    

    // Create an index with non-default settings
    if (pattern == 'create_index') {
        const settings = {
            settings: {
                index: {
                    number_of_shards: 4,
                    number_of_replicas: 3,
                },
            },
        };
          
        const response = await client.indices.create({
            index: index_name,
            body: settings,
        });

        console.log('Creating index:');
        console.log(response.body);

        return response;
    }

    // Add a document to the index.
    if (pattern == 'create_item') {
        const document = {
            name: 'The Outsider',
        };

        const response = await client.index({
            id: id,
            index: index_name,
            body: document,
            refresh: true,
        });

        console.log('Adding document:');
        console.log(response.body);

        return response;
    }

    // Search for the document.
    if (pattern == 'search') {
        const query = {
            query: {
                match: {
                    name: {
                        query: 'Not Harry Potter',
                    },
                },
            },
        };
    
        const response = await client.search({
            index: index_name,
            body: query,
        });
    
        console.log('Search results:');
        console.log(response.body.hits.hits[0]._source);
            
        return response;
    }

    // Delete the document.
    if (pattern == 'delete_item') {

        const id = '2';

        const response = await client.delete({
            index: index_name,
            id: id,
        });
        
        console.log('Deleting item:');
        console.log(response.body);

        return response;
    }

    // Delete the index.
    if (pattern == 'delete_item') {

        const response = await client.indices.delete({
            index: index_name,
        });
        
        console.log('Deleting index:');
        console.log(response.body);

        return response;
    }

    return null;    
};

export { handler };
