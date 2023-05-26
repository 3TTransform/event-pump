import { Pool, Client } from "pg";
import { populateEventData } from "../utils";
import { replaceValues } from "../template";
require("dotenv").config();

let connection;

const createPool = () => {
    const pool = new Pool({
        user: process.env.PG_USER,
        password: process.env.PG_PASS,
        host: process.env.PG_HOST,
        database: process.env.PG_DB,
        port: process.env.PG_PORT,
    });
    return pool;
};

const getPool = () => {
    if (!connection) {
        connection = createPool();
    }
    return connection;
};

export const postgresSqlHydrateOne = async (
    pattern: any,
    event: any,
    isFirstEvent: boolean
) => {
    try {
        let replacedSQL = replaceValues(event, pattern.action.params.sql);
        await getPool().query(replacedSQL);
    } catch (err) {
        console.log(`${event.id} failed ${err.message}`);
    }
};
