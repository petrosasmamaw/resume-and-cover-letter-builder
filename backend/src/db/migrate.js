import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { pool, isPlaceholderDb } from './pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function migrate() {
  if (isPlaceholderDb) {
    console.error(
      '⚠️  DATABASE_URL is still the demo placeholder. Replace it in backend/.env with your Neon connection string, then re-run: npm run migrate'
    );
    process.exit(1);
  }

  const schemaPath = path.resolve(__dirname, '../../sql/schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  try {
    await pool.query(sql);
    console.log('✓ Migrations applied successfully');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
