function logTitles(error, result) {
    if (error) {
        console.error(error);
    } else {
        console.log(result.body.hits.hits);
        //console.log(`Number of returned results is ${hits.length}`);
        //console.log(hits.map(hit => hit._source.title));
    }
}

const term = (client, index_name, field, value) => {
    console.log(`Searching for values in the field ${field} equal to ${value}`);
    const body = {
        query: {
            term: {
                [field]: value,
            },
        },
    };
    client.search(
        {
            index: index_name,
            body,
        },
        logTitles
    );
};


const range = (client, index_name, field, gte, lte) => {
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
    client.search(
        {
            index: index_name,
            body,
        },
        logTitles
    );
};

const fuzzy = (client, index_name, field, value, fuzziness) => {
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
    client.search(
        {
            index: index_name,
            body: query,
        },
        logTitles
    );
};

const match = (client, index_name, field, query) => {
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
    client.search(
        {
            index: index_name,
            body,
        },
        logTitles
    );
};

const  slop = (client, index_name, field, query, slop) => {
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
    client.search(
        {
            index: index_name,
            body,
        },
        logTitles
    );
};

const qUery = (client, index_name, field, query, size) => {
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
    client.search(
        {
            index: index_name,
            body,
            size,
        },
        logTitles
    );
};  

export {
    term,
    range,
    fuzzy,
    match,
    slop,
    qUery,
};
