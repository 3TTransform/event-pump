import { replaceValues } from '../template';
import { populateEventData } from '../utils';
import sql from 'mssql';
import dotenv from 'dotenv';
import { runSQL } from './mssqltools';
dotenv.config();

const {
    SQL_SERV: sqlServer,
    SQL_USER: sqlUser,
    SQL_PASS: sqlPassword,
    SQL_DB: sqlDatabase,
} = process.env;
const connectionString = `Data Source=${sqlServer};Initial Catalog=${sqlDatabase};User ID=${sqlUser};Password=${sqlPassword};Connection Timeout=1000;TrustServerCertificate=true;`;
const poolPromise = new sql.ConnectionPool(connectionString);

export const mssqlHydrateOne = async (
    pattern: any,
    event: any,
    isFirstEvent: boolean,
) => {
    const populatedParameters = populateEventData(
        event,
        pattern.action.params.input,
    );

    let replacedSQL = replaceValues(event, pattern.action.params.sql);
    replacedSQL = replacedSQL.replace(/,\s*WHERE/g, ' WHERE');
    try {
        await runSQL(poolPromise, replacedSQL, populatedParameters);
    } catch (err) {
        console.info(`${event.id} failed ${err.message}`);
    }
};

export const mssqlTableCreate = async (action: any) => {
    const tableName = `[${action.schema ?? 'dbo'}].[${action.table}]`;

    let sql = `CREATE TABLE ${tableName} (`;
    action.fields.forEach(element => {
        sql += ` ${element.name} ${element.type} `;
        sql += element.nullable ? 'NULL ' : 'NOT NULL ';
        sql += element.unique ? 'UNIQUE ' : '';
        sql += element.identity ? 'IDENTITY ' : '';
        sql += ',';
    });
    sql = sql.slice(0, -1) + ');';

    if (action.primarykey)
        sql += ` ALTER TABLE ${tableName} ADD CONSTRAINT PK_${action.primarykey} PRIMARY KEY (${action.primarykey});`;

    action.constraint?.forEach(element => {
        sql += ` ALTER TABLE ${tableName} ADD CONSTRAINT ${element.name} ${element.value};`;
    });
    action.foreignkey?.forEach(element => {
        sql += ` ALTER TABLE ${tableName} ADD CONSTRAINT FK_${element.name} FOREIGN KEY ${element.value};`;
    });
    action.index?.forEach(element => {
        sql += ' CREATE ';
        sql += element.unique ? 'UNIQUE ' : '';
        sql += element.clustered ? 'CLUSTERED ' : '';
        sql += `INDEX ${element.name} on ${tableName} ${element.value};`;
    });

    console.log(sql);
    await runSQL(poolPromise, sql);
};
