import { neon } from '@neondatabase/serverless';
import { requireUser } from './auth.js';

const sql = neon(process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL);
const h = { 'Content-Type': 'application/json' };

export const handler = async (event, context) => {
  let userId;
  try {
    const user = requireUser(event, context);
    userId = user.sub;
  } catch (authErr) {
    return authErr;
  }

  try {
    const rows = await sql`SELECT name FROM range_locations WHERE user_id = ${userId} ORDER BY name`;
    return { statusCode: 200, headers: h, body: JSON.stringify(rows.map(r => r.name)) };
  } catch (err) {
    return { statusCode: 500, headers: h, body: JSON.stringify({ error: err.message }) };
  }
};
