//import { sql } from "mssql";
const sql = require("mssql");

const sqlUser = "sa-Event-Source";
const sqlPassword = "password1";
const sqlServer = "3TLAPTOP-10527";
const sqlDatabase = 'EventSource_example';
const connectionString = `Data Source=${sqlServer};Initial Catalog=${sqlDatabase};User ID=${sqlUser};Password=${sqlPassword};Connection Timeout=1000;TrustServerCertificate=true;`;

const poolPromise = new sql.ConnectionPool(connectionString);

export const runSQL = async (sqlCommand) => {
  const poolConnection = await poolPromise.connect();
  const request = await poolConnection.request();
  const result = await request.query(sqlCommand);
  return result;
}

