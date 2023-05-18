import { Client } from "pg";
import { populateEventData } from '../utils';
import { replaceValues } from '../template';
require("dotenv").config();

// Create a new PostgreSQL client
const client = new Client({
  user: process.env.PG_USER,
  password: process.env.PG_PASS,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  port: process.env.PG_PORT, // Default PostgreSQL port
});

const executeQuery = async(query: string, params?: any[]): Promise<any> => {
  const connection = await client.connect();

  try {
    const result = await connection.query(query, params);
    return result.rows;
  } finally {
    connection.release();
  }
}
// Connect to the PostgreSQL server
client.connect((err) => {
  if (err) {
    console.error("Error connecting to PostgreSQL:", err);
    return;
  }
  console.log("Connected to PostgreSQL!");

  // Execute queries or perform operations on the database here

  // Disconnect from the PostgreSQL server
  client.end((endErr) => {
    if (endErr) {
      console.error("Error disconnecting from PostgreSQL:", endErr);
      return;
    }
    console.log("Disconnected from PostgreSQL.");
  });

  // Function to execute the PostgreSQL query
  async function executeQuery(query: string, params?: any[]): Promise<any> {
    const connection = await client.connect();

    try {
      const result = await connection.query(query, params);
      return result.rows;
    } finally {
      connection.end();
    }
  }

  // Example usage
  async function getUsers(): Promise<any[]> {
    const query = "SELECT * FROM table_name";
    const users = await executeQuery(query);
    return users;
  }
});

export const postgresSqlHydrateOne = async (
  pattern: any,
  event: any,
  isFirstEvent: boolean
) => {

  const populatedParameters = populateEventData(event, pattern.action.params.input);

  let replacedSQL = replaceValues(event, pattern.action.params.sql);
  replacedSQL = replacedSQL.replace(/,\s*WHERE/g, ' WHERE');

  try {
      await executeQuery(replacedSQL, populatedParameters);
  } catch (err) {
      console.log(`${event.id} failed ${err.message}`);
  }
};
