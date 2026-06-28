require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/neurodash',
});

async function setup() {
  await client.connect();
  await client.query('CREATE EXTENSION IF NOT EXISTS vector;');
  console.log('Created vector extension');
  await client.end();
}

setup().catch(console.error);
