import 'dotenv/config';
import { Client } from 'pg';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set.');
}

function buildAdminConnectionString(url: string) {
  // Replace the final database path with the postgres default database.
  return url.replace(/\/[^/]+$/u, '/postgres');
}

async function main() {
  const databaseUrlValue = databaseUrl as string;
  const adminConnectionString = buildAdminConnectionString(databaseUrlValue);
  const client = new Client({ connectionString: adminConnectionString });
  try {
    await client.connect();
    console.log('Connected to Postgres admin database');
    const targetDb = databaseUrlValue.replace(/.*\/(.+)$/u, '$1');
    const escapedDbName = targetDb.replace(/"/g, '""');
    const check = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [targetDb]);
    if (check.rowCount === 0) {
      console.log(`Database ${targetDb} does not exist. Creating...`);
      await client.query(`CREATE DATABASE "${escapedDbName}"`);
      console.log(`Created database ${targetDb}`);
    } else {
      console.log(`Database ${targetDb} already exists.`);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Database provisioning failed:', error);
  process.exit(1);
});