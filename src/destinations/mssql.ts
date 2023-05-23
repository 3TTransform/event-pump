import { replaceValues } from '../template';
import { populateEventData } from '../utils';

require('dotenv').config();
const sql = require('mssql');

const {
    SQL_SERV: sqlServer,
    SQL_USER: sqlUser,
    SQL_PASS: sqlPassword,
    SQL_DB: sqlDatabase,
} = process.env;

const connectionString = `Data Source=${sqlServer};Initial Catalog=${sqlDatabase};User ID=${sqlUser};Password=${sqlPassword};Connection Timeout=1000;TrustServerCertificate=true;`;

const poolPromise = new sql.ConnectionPool(connectionString);

const runSQL = async (sqlCommand, input) => {
    const poolConnection = await poolPromise.connect();
    const request = await poolConnection.request();

    for (const key of input) {
        request.input(key.name, key.value);
    }

    const result = await request.query(sqlCommand);
    poolConnection.close();
    return result;
};

export const mssqlHydrateOne = async (
    pattern: any,
    event: any,
    isFirstEvent: boolean
) => {

    const populatedParameters = populateEventData(event, pattern.action.params.input);

    let replacedSQL = replaceValues(event, pattern.action.params.sql);
    replacedSQL = replacedSQL.replace(/,\s*WHERE/g, ' WHERE');
    try {
        await runSQL(replacedSQL, populatedParameters);
    } catch (err) {
        console.log(`${event.id} failed ${err.message}`);
    }
};
