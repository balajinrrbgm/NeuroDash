import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../db/schema';

// Connection pool configured for AWS Aurora PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Add SSL if using Aurora publicly or required by your security groups
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });
