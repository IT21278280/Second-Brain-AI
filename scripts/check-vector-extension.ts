import 'dotenv/config';
import { Client } from 'pg';

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not configured');
  }

  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    const res = await client.query("SELECT name, default_version FROM pg_available_extensions WHERE name = 'vector';");
    console.log('pg_available_extensions result:', res.rows);
    const installed = await client.query("SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';");
    console.log('pg_extension result:', installed.rows);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('vector extension check failed:', error);
  process.exit(1);
});