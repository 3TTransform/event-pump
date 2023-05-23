import { Client, Pool } from "pg";
import { populateEventData } from "../utils";
import { replaceValues } from "../template";
import { error } from "console";
require("dotenv").config();

// Create a new PostgreSQL client
// const client = new Client({
//   user: process.env.PG_USER,
//   password: process.env.PG_PASS,
//   host: process.env.PG_HOST,
//   database: process.env.PG_DB,
//   port: process.env.PG_PORT, // Default PostgreSQL port
// });

let connection;

const executeQuery = async (query: string, params?: any[]): Promise<any> => {
  const pool = new Pool({
    user: process.env.PG_USER,
    password: process.env.PG_PASS,
    host: process.env.PG_HOST,
    database: process.env.PG_DB,
    port: process.env.PG_PORT
  });

  console.log("🙏");
  pool.query(query, [], (error2, data) => {
    console.log("😄");
    console.log(error2, data);
    pool.end();
  });
 
};

export const postgresSqlHydrateOne = async (
  pattern: any,
  event: any,
  isFirstEvent: boolean
) => {
  const populatedParameters = populateEventData(
    event,
    pattern.action.params.input
  );
  console.log(`connection = ${connection}`);

  let replacedSQL = replaceValues(event, pattern.action.params.sql);
  replacedSQL = replacedSQL.replace(/,\s*WHERE/g, " WHERE");
  //replacedSQL = "SELECT 5 AS COLUMN_ONE, 'col 2 value' AS COLUMN_TWO";
  
  try {
    console.log(`replacedSQL = ${replacedSQL}`);
    console.log(`populatedParameters = ${populatedParameters}`);
    await executeQuery(replacedSQL, populatedParameters);
  } catch (err) {
    console.log(`${event.id} failed ${err.message}`);
  }
};
