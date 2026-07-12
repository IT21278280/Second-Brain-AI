import "dotenv/config";
import { Client } from "pg";

const url = process.env.DATABASE_URL;
console.log("using url", url ? `${url.slice(0, 80)}${url.length > 80 ? "..." : ""}` : "NO_URL");

const client = new Client({ connectionString: url });
try {
  await client.connect();
  const res = await client.query("select 1");
  console.log("connected", res.rows);
} catch (err) {
  console.error("error", err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  await client.end();
}
