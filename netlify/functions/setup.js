import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL);

export const handler = async () => {
  const headers = { 'Content-Type': 'application/json' };
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS guns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        caliber TEXT NOT NULL,
        photo_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS shooting_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        gun_id UUID REFERENCES guns(id) ON DELETE CASCADE,
        session_date DATE NOT NULL,
        rounds_fired INTEGER NOT NULL,
        range_location TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS cleaning_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        gun_id UUID REFERENCES guns(id) ON DELETE CASCADE,
        cleaned_at DATE NOT NULL,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS range_locations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT UNIQUE NOT NULL
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS suppressors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        calibers TEXT[] NOT NULL DEFAULT '{}',
        brand TEXT,
        base_shot_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS suppressor_cleaning_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        suppressor_id UUID REFERENCES suppressors(id) ON DELETE CASCADE,
        cleaned_at DATE NOT NULL,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    // Migrations
    await sql`
      ALTER TABLE guns ADD COLUMN IF NOT EXISTS base_round_count INTEGER NOT NULL DEFAULT 0
    `;
    await sql`
      ALTER TABLE shooting_sessions ADD COLUMN IF NOT EXISTS suppressor_id UUID REFERENCES suppressors(id) ON DELETE SET NULL
    `;
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
