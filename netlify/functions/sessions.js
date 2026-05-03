import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL);
const h = { 'Content-Type': 'application/json' };

export const handler = async (event) => {
  try {
    if (event.httpMethod === 'GET') {
      const q = event.queryStringParameters || {};
      const gunId    = q.gunId    || null;
      const month    = q.month    || null;
      const caliber  = q.caliber  || null;
      const rangeVal = q.range    || null;

      const sessions = await sql`
        SELECT s.*, g.name AS gun_name, g.caliber AS gun_caliber
        FROM shooting_sessions s
        LEFT JOIN guns g ON s.gun_id = g.id
        WHERE (${gunId}::UUID IS NULL OR s.gun_id = ${gunId}::UUID)
          AND (${month}::text IS NULL OR TO_CHAR(s.session_date, 'YYYY-MM') = ${month}::text)
          AND (${caliber}::text IS NULL OR g.caliber = ${caliber}::text)
          AND (${rangeVal}::text IS NULL OR s.range_location = ${rangeVal}::text)
        ORDER BY s.session_date DESC, s.created_at DESC
      `;
      return { statusCode: 200, headers: h, body: JSON.stringify(sessions) };
    }

    if (event.httpMethod === 'POST') {
      const { gun_id, session_date, rounds_fired, range_location, notes, suppressor_id } =
        JSON.parse(event.body || '{}');

      if (!gun_id || !session_date || !rounds_fired) {
        return {
          statusCode: 400, headers: h,
          body: JSON.stringify({ error: 'gun_id, session_date, and rounds_fired are required' }),
        };
      }

      if (range_location) {
        await sql`
          INSERT INTO range_locations (name) VALUES (${range_location})
          ON CONFLICT (name) DO NOTHING
        `;
      }

      const [session] = await sql`
        INSERT INTO shooting_sessions (gun_id, session_date, rounds_fired, range_location, notes, suppressor_id)
        VALUES (${gun_id}, ${session_date}, ${rounds_fired}, ${range_location || null}, ${notes || null}, ${suppressor_id || null})
        RETURNING *
      `;
      return { statusCode: 201, headers: h, body: JSON.stringify(session) };
    }

    if (event.httpMethod === 'DELETE') {
      const sessionId = event.queryStringParameters?.id;
      if (!sessionId) {
        return { statusCode: 400, headers: h, body: JSON.stringify({ error: 'Missing id' }) };
      }
      await sql`DELETE FROM shooting_sessions WHERE id = ${sessionId}::uuid`;
      return { statusCode: 204, headers: h, body: '' };
    }

    return { statusCode: 405, headers: h, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    return { statusCode: 500, headers: h, body: JSON.stringify({ error: err.message }) };
  }
};
