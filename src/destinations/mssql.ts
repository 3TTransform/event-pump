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

/**
 * @param { string } sqlCommand - The SQL query text
 * @param { object } input - The parameters of the query
 * @return { object } The results of the SQL query
 * @throws SQL errors
 */
export const runSQL = async (sqlCommand, input) => {
  const poolConnection = await poolPromise.connect();
  const request = await poolConnection.request();

  for (const key of input) {
    request.input(key.name, key.value);
  }

  // TODO: Handle output parameters
  // outputs?.forEach(x => request.output(x));

  const result = await request.query(sqlCommand);
  poolConnection.close();
  return result;
};
