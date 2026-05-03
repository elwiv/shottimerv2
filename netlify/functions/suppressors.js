import { neon } from '@neondatabase/serverless';
import { requireUser } from './auth.js';

const sql = neon(process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL);
const h = { 'Content-Type': 'application/json' };

export const handler = async (event, context) => {
  let userId, isDemo;
  try {
    const user = requireUser(event, context);
    userId = user.sub;
    isDemo = userId === 'demo-user';
  } catch (authErr) {
    return authErr;
  }

  try {
    if (event.httpMethod === 'GET') {
      const suppressors = await sql`
        SELECT sp.*,
          COALESCE(SUM(s.rounds_fired), 0)::int + sp.base_shot_count AS total_shots
        FROM suppressors sp
        LEFT JOIN shooting_sessions s ON s.suppressor_id = sp.id
        WHERE sp.user_id = ${userId}
        GROUP BY sp.id
        ORDER BY sp.created_at DESC
      `;
      return { statusCode: 200, headers: h, body: JSON.stringify(suppressors) };
    }

    if (event.httpMethod === 'POST') {
      if (isDemo) return { statusCode: 403, headers: h, body: JSON.stringify({ error: 'Demo mode is read-only' }) };
      const { name, calibers, brand, base_shot_count } = JSON.parse(event.body || '{}');
      if (!name || !calibers || !calibers.length) {
        return { statusCode: 400, headers: h, body: JSON.stringify({ error: 'name and calibers required' }) };
      }
      const [sup] = await sql`
        INSERT INTO suppressors (name, calibers, brand, base_shot_count, user_id)
        VALUES (${name}, ${calibers}, ${brand || null}, ${parseInt(base_shot_count) || 0}, ${userId})
        RETURNING *
      `;
      return { statusCode: 201, headers: h, body: JSON.stringify(sup) };
    }

    return { statusCode: 405, headers: h, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    return { statusCode: 500, headers: h, body: JSON.stringify({ error: err.message }) };
  }
};
