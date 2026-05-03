import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL);
const h = { 'Content-Type': 'application/json' };

export const handler = async (event) => {
  try {
    if (event.httpMethod === 'GET') {
      const guns = await sql`
        SELECT g.*,
          COALESCE(SUM(s.rounds_fired), 0)::int + g.base_round_count AS total_rounds,
          COALESCE((
            SELECT SUM(s2.rounds_fired)::int
            FROM shooting_sessions s2
            WHERE s2.gun_id = g.id
              AND s2.session_date > COALESCE(
                (SELECT cl.cleaned_at FROM cleaning_logs cl WHERE cl.gun_id = g.id ORDER BY cl.cleaned_at DESC LIMIT 1),
                '1900-01-01'::DATE
              )
          ), 0)::int AS rounds_since_cleaning
        FROM guns g
        LEFT JOIN shooting_sessions s ON s.gun_id = g.id
        GROUP BY g.id
        ORDER BY g.created_at DESC
      `;
      return { statusCode: 200, headers: h, body: JSON.stringify(guns) };
    }

    if (event.httpMethod === 'POST') {
      const { name, caliber, brand, photo_url, base_round_count } = JSON.parse(event.body || '{}');
      if (!name || !caliber) {
        return { statusCode: 400, headers: h, body: JSON.stringify({ error: 'name and caliber required' }) };
      }
      const [gun] = await sql`
        INSERT INTO guns (name, caliber, brand, photo_url, base_round_count)
        VALUES (${name}, ${caliber}, ${brand || null}, ${photo_url || null}, ${parseInt(base_round_count) || 0})
        RETURNING *
      `;
      return { statusCode: 201, headers: h, body: JSON.stringify(gun) };
    }

    return { statusCode: 405, headers: h, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    return { statusCode: 500, headers: h, body: JSON.stringify({ error: err.message }) };
  }
};
