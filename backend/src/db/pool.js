import dotenv from 'dotenv';
import pg from 'pg';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { Pool } = pg;

const PLACEHOLDER_DB =
  'postgresql://demo_user:demo_pass@demo-host.neon.tech/demo_db?sslmode=require';

export const isPlaceholderDb =
  !process.env.DATABASE_URL || process.env.DATABASE_URL === PLACEHOLDER_DB;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : undefined,
});

export async function query(text, params) {
  return pool.query(text, params);
}
