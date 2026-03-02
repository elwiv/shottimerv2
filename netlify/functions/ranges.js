import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NETLIFY_DATABASE_URL);
const h = { 'Content-Type': 'application/json' };

export const handler = async () => {
  try {
    const rows = await sql`SELECT name FROM range_locations ORDER BY name`;
    return { statusCode: 200, headers: h, body: JSON.stringify(rows.map(r => r.name)) };
  } catch (err) {
    return { statusCode: 500, headers: h, body: JSON.stringify({ error: err.message }) };
  }
};
