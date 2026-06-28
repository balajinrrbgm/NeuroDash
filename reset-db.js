require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query('DROP TABLE IF EXISTS feedback_items, feedback_sources, workspaces CASCADE');
  console.log('Tables dropped');
  await client.end();
}

main().catch(err => { console.error(err.message); process.exit(1); });
