//import { sql } from "mssql";
require("dotenv").config();
const sql = require("mssql");

const { SQL_SERV: sqlServer, SQL_USER: sqlUser, SQL_PASS: sqlPassword } = process.env;

const sqlDatabase = 'EventSource_example';
const connectionString = `Data Source=${sqlServer};Initial Catalog=${sqlDatabase};User ID=${sqlUser};Password=${sqlPassword};Connection Timeout=1000;TrustServerCertificate=true;`;

const poolPromise = new sql.ConnectionPool(connectionString);

export const runSQL = async (sqlCommand, input) => {
  const poolConnection = await poolPromise.connect();
  const request = await poolConnection.request();

  //console.log(JSON.stringify(input));

  for (const key of input) {
    request.input(key.name, key.value);    
  }

  //console.log(JSON.stringify(request.input));

  //outputs?.forEach(x => request.output(x));

  const result = await request.query(sqlCommand);
  poolConnection.close();
  return result;
}

