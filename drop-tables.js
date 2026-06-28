require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const c = new Client({ connectionString: process.env.DATABASE_URL });
c.connect()
  .then(() => c.query('DROP TABLE IF EXISTS feedback_items, feedback_sources, workspaces CASCADE'))
  .then(() => { console.log('Tables dropped'); return c.end(); })
  .catch(e => { console.error(e.message); process.exit(1); });
