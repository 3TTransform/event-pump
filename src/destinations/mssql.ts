//import { sql } from "mssql";
const sql = require("mssql");

const sqlUser = "3ttaskers";
const sqlPassword = "Password1!";
const sqlServer = "localhost";
const sqlDatabase = 'EventSource_example';
const connectionString = `Data Source=${sqlServer};Initial Catalog=${sqlDatabase};User ID=${sqlUser};Password=${sqlPassword};Connection Timeout=1000;TrustServerCertificate=true;`;

const poolPromise = new sql.ConnectionPool(connectionString);

export const runSQL = async (sqlCommand) => {
  const poolConnection = await poolPromise.connect();
  const request = await poolConnection.request();
  const result = await request.query(sqlCommand);
  return result;
}

