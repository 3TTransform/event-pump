import { Client } from "pg";
import { populateEventData } from "../utils";
import { replaceValues } from "../template";
import { error } from "console";
require("dotenv").config();

// Create a new PostgreSQL client
const client = new Client({
  user: process.env.PG_USER,
  password: process.env.PG_PASS,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  port: process.env.PG_PORT, // Default PostgreSQL port
});

const executeQuery = async (query: string, params?: any[]): Promise<any> => {
  console.log("😍");
  const connection = await client.connect();
  console.log("😄");
  console.log();
  try {
    const result = await connection.query(query, params);
    return result.rows;
  } catch (error) {
    console.log("😡");
    console.log(error);
  } finally {
    connection.release();
  }
};

  // Connect to the PostgreSQL server
  // client.connect((err) => {
  //   if (err) {
  //     console.error("Error connecting to PostgreSQL:", err);
  //     return;
  //   }
  //   console.log("Connected to PostgreSQL!");

  // // Disconnect from the PostgreSQL server
  // client.end((endErr) => {
  //   if (endErr) {
  //     console.error("Error disconnecting from PostgreSQL:", endErr);
  //     return;
  //   }
  //   console.log("Disconnected from PostgreSQL.");
  // });
  // Execute queries or perform operations on the database here
// });

export const postgresSqlHydrateOne = async (
  pattern: any,
  event: any,
  isFirstEvent: boolean
) => {
  const populatedParameters = populateEventData(
    event,
    pattern.action.params.input
  );

  let replacedSQL = replaceValues(event, pattern.action.params.sql);
  replacedSQL = replacedSQL.replace(/,\s*WHERE/g, " WHERE");
  console.log("🙏");
  try {
    await executeQuery(replacedSQL, populatedParameters);
  } catch (err) {
    console.log(`${event.id} failed ${err.message}`);
  }
};
