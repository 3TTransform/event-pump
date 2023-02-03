//import { sql } from "mssql";
require("dotenv").config();
const sql = require("mssql");

const { SQL_SERV: sqlServer, SQL_USER: sqlUser, SQL_PASS: sqlPassword } = process.env;

const sqlDatabase = 'EventSource_example';
const connectionString = `Data Source=${sqlServer};Initial Catalog=${sqlDatabase};User ID=${sqlUser};Password=${sqlPassword};Connection Timeout=1000;TrustServerCertificate=true;`;

const poolPromise = new sql.ConnectionPool(connectionString);

export const runSQL = async (sqlCommand) => {
  const poolConnection = await poolPromise.connect();
  const request = await poolConnection.request();
  const result = await request.query(sqlCommand);
  return result;
}

