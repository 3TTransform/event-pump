function logTitles(error, result) {
    if (error) {
        console.error(error);
    } else {
        console.log(result.body.hits.hits);
    }
}

const term = async (client, index_name, field, value) => {
    console.log(`Searching for values in the field ${field} equal to ${value}`);
    const body = {
        query: {
            term: {
                [field]: value,
            },
        },
    };
    const response =  await client.search(
        {
            index: index_name,
            body,
        },
        //logTitles
    );
    return response;
};


const range = async (client, index_name, field, gte, lte) => {
    console.log(
        `Searching for values in the ${field} ranging from ${gte} to ${lte}`
    );
    const body = {
        query: {
            range: {
                [field]: {
                    gte,
                    lte,
                },
            },
        },
    };
    const response =  await client.search(
        {
            index: index_name,
            body,
        },
        //logTitles
    );
    return response;
};

const fuzzy = async (client, index_name, field, value, fuzziness) => {
    console.log(
        `Search for ${value} in the ${field} with fuzziness set to ${fuzziness}`
    );
    const query = {
        query: {
            fuzzy: {
                [field]: {
                    value,
                    fuzziness,
                },
            },
        },
    };
    const response =  await client.search(
        {
            index: index_name,
            body: query,
        },
        //logTitles
    );
    return response;
};

const match = async (client, index_name, field, query) => {
    console.log(`Searching for ${query} in the field ${field}`);
    const body = {
        query: {
            match: {
                [field]: {
                    query,
                },
            },
        },
    };
    const response =  await client.search(
        {
            index: index_name,
            body,
        },
        //logTitles
    );
    return response;
};

const  slop = async (client, index_name, field, query, slop) => {
    console.log(
        `Searching for ${query} with slop value ${slop} in the field ${field}`
    );
    const body = {
        query: {
            match_phrase: {
                [field]: {
                    query,
                    slop,
                },
            },
        },
    };
    const response =  await client.search(
        {
            index: index_name,
            body,
        },
        //logTitles
    );
    return response;

};

const qUery = async (client, index_name, field, query, size) => {
    console.log(
        `Searching for ${query} in the field ${field} and returning maximum ${size} results`
    );
    const body = {
        query: {
            query_string: {
                default_field: field,
                query,
            },
        },
    };
    const response =  await client.search(
        {
            index: index_name,
            body,
            size,
        },
        //logTitles
    );
    return response;
};

const all = async (client, index_name, size) => {
    console.log(
        `Searching in ${index_name} returning all results`
    );
    const body = {
        query: {
            match_all: {},
        },
    };
    const response =  await client.search(
        {
            index: index_name,
            body,
            size,
        },
        //logTitles
    );
    return response;
};

export {
    term,
    range,
    fuzzy,
    match,
    slop,
    qUery,
    all,
};
