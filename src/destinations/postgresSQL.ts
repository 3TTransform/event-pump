import { Pool } from "pg";
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
        //console.log('🌈', pattern);
        //console.log('🐸', event);
        const replacedSQL = replaceValues(event, pattern.action.params.sql);
        //console.log(replacedSQL);
        await getPool().query(replacedSQL);
    } catch (err) {
        console.log(`${event.id} failed ${err.message}`);
    }
};

export const postgresSqlTableCreate = async (
    action: any,
) => {
    let sql = `CREATE TABLE ${action.table} (`;
    action.fields.forEach( (element) => {
        sql += ` ${element.name} ${element.type} `;
        sql += element.nullable ? 'NULL ' : 'NOT NULL ';
        sql += element.unique ? 'UNIQUE ' : '';
        sql += ',';
    });
    sql = sql.slice(0, -1) + ');';

    if (action.primarykey) 
        sql += ` ALTER TABLE ${action.table} ADD CONSTRAINT PK_${action.primarykey} PRIMARY KEY (${action.primarykey});`;

    action.constraint?.forEach( (element) => {
        sql += ` ALTER TABLE ${action.table} ADD CONSTRAINT ${element.name} ${element.value};`;
    });
    action.foreignkey?.forEach( (element) => {
        sql += ` ALTER TABLE ${action.table} ADD CONSTRAINT FK_${element.name} FOREIGN KEY ${element.value};`;
    });

    console.log(sql);
    await getPool().query(sql);
};

