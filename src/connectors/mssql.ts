import { replaceValues } from "../template";
import { populateEventData } from "../utils";

//import { sql } from "mssql";
require("dotenv").config();
const sql = require("mssql");

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

export const mssqlHydrateOne = async (pattern, event) => {
  let sql = pattern.action.params.sql;
  let input = pattern.action.params.input;

  const sqlStatement = populateEventData(event, input, false);

  const thisVerb = pattern.rule.verb;

  let replacedSQL = replaceValues(event, sql);
  replacedSQL = replacedSQL.replace(/,\s*WHERE/g, " WHERE");
  try {
    await runSQL(replacedSQL, sqlStatement);
    console.log(`${event.id} ${thisVerb}d`);
  } catch (err) {
    console.log(`${event.id} failed ${err.message}`);
  }
};
