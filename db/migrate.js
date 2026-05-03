import { neon } from '@neondatabase/serverless';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS _migrations (
    name TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ DEFAULT NOW()
  )
`;

const applied = new Set(
  (await sql`SELECT name FROM _migrations`).map((r) => r.name)
);

const files = readdirSync(join(__dir, 'migrations'))
  .filter((f) => f.endsWith('.sql'))
  .sort();

for (const file of files) {
  if (applied.has(file)) {
    console.log(`skip  ${file}`);
    continue;
  }
  const migration = readFileSync(join(__dir, 'migrations', file), 'utf8');
  const statements = migration.split(';').map((s) => s.trim()).filter(Boolean);
  for (const stmt of statements) {
    await sql.unsafe(stmt);
  }
  await sql`INSERT INTO _migrations (name) VALUES (${file})`;
  console.log(`apply ${file}`);
}

console.log('done');
