import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL);
const h = { 'Content-Type': 'application/json' };

export const handler = async (event) => {
  try {
    if (event.httpMethod === 'GET') {
      const suppressors = await sql`
        SELECT sp.*,
          COALESCE(SUM(s.rounds_fired), 0)::int + sp.base_shot_count AS total_shots
        FROM suppressors sp
        LEFT JOIN shooting_sessions s ON s.suppressor_id = sp.id
        GROUP BY sp.id
        ORDER BY sp.created_at DESC
      `;
      return { statusCode: 200, headers: h, body: JSON.stringify(suppressors) };
    }

    if (event.httpMethod === 'POST') {
      const { name, calibers, brand, base_shot_count } = JSON.parse(event.body || '{}');
      if (!name || !calibers || !calibers.length) {
        return { statusCode: 400, headers: h, body: JSON.stringify({ error: 'name and calibers required' }) };
      }
      const [sup] = await sql`
        INSERT INTO suppressors (name, calibers, brand, base_shot_count)
        VALUES (${name}, ${calibers}, ${brand || null}, ${parseInt(base_shot_count) || 0})
        RETURNING *
      `;
      return { statusCode: 201, headers: h, body: JSON.stringify(sup) };
    }

    return { statusCode: 405, headers: h, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    return { statusCode: 500, headers: h, body: JSON.stringify({ error: err.message }) };
  }
};
