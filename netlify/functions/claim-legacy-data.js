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

  if (userId === 'demo-user') {
    return { statusCode: 403, headers: h, body: JSON.stringify({ error: 'Not available in demo mode' }) };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: h, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const LEGACY = 'legacy-user';

    const [{ count: guns }] = await sql`
      UPDATE guns SET user_id = ${userId} WHERE user_id = ${LEGACY} RETURNING COUNT(*)::int AS count
    `;
    const [{ count: sessions }] = await sql`
      UPDATE shooting_sessions SET user_id = ${userId} WHERE user_id = ${LEGACY} RETURNING COUNT(*)::int AS count
    `;
    const [{ count: cleanings }] = await sql`
      UPDATE cleaning_logs SET user_id = ${userId} WHERE user_id = ${LEGACY} RETURNING COUNT(*)::int AS count
    `;
    const [{ count: ranges }] = await sql`
      UPDATE range_locations SET user_id = ${userId} WHERE user_id = ${LEGACY} RETURNING COUNT(*)::int AS count
    `;
    const [{ count: suppressors }] = await sql`
      UPDATE suppressors SET user_id = ${userId} WHERE user_id = ${LEGACY} RETURNING COUNT(*)::int AS count
    `;
    const [{ count: suppressorCleanings }] = await sql`
      UPDATE suppressor_cleaning_logs SET user_id = ${userId} WHERE user_id = ${LEGACY} RETURNING COUNT(*)::int AS count
    `;

    return {
      statusCode: 200, headers: h,
      body: JSON.stringify({
        ok: true,
        migrated: { guns, sessions, cleanings, ranges, suppressors, suppressorCleanings },
      }),
    };
  } catch (err) {
    return { statusCode: 500, headers: h, body: JSON.stringify({ error: err.message }) };
  }
};
