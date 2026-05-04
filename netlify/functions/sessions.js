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
      const q = event.queryStringParameters || {};
      const gunId    = q.gunId    || null;
      const month    = q.month    || null;
      const caliber  = q.caliber  || null;
      const rangeVal = q.range    || null;

      const sessions = await sql`
        SELECT s.*, g.name AS gun_name, g.caliber AS gun_caliber
        FROM shooting_sessions s
        LEFT JOIN guns g ON s.gun_id = g.id
        WHERE s.user_id = ${userId}
          AND (${gunId}::UUID IS NULL OR s.gun_id = ${gunId}::UUID)
          AND (${month}::text IS NULL OR TO_CHAR(s.session_date, 'YYYY-MM') = ${month}::text)
          AND (${caliber}::text IS NULL OR g.caliber = ${caliber}::text)
          AND (${rangeVal}::text IS NULL OR s.range_location = ${rangeVal}::text)
        ORDER BY s.session_date DESC, s.created_at DESC
      `;
      return { statusCode: 200, headers: h, body: JSON.stringify(sessions) };
    }

    if (event.httpMethod === 'POST') {
      if (isDemo) return { statusCode: 403, headers: h, body: JSON.stringify({ error: 'Demo mode is read-only' }) };
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
          INSERT INTO range_locations (name, user_id) VALUES (${range_location}, ${userId})
          ON CONFLICT (name, user_id) DO NOTHING
        `;
      }

      const [session] = await sql`
        INSERT INTO shooting_sessions (gun_id, session_date, rounds_fired, range_location, notes, suppressor_id, user_id)
        VALUES (${gun_id}, ${session_date}, ${rounds_fired}, ${range_location || null}, ${notes || null}, ${suppressor_id || null}, ${userId})
        RETURNING *
      `;
      return { statusCode: 201, headers: h, body: JSON.stringify(session) };
    }

    if (event.httpMethod === 'PUT') {
      if (isDemo) return { statusCode: 403, headers: h, body: JSON.stringify({ error: 'Demo mode is read-only' }) };
      const sessionId = event.queryStringParameters?.id;
      if (!sessionId) {
        return { statusCode: 400, headers: h, body: JSON.stringify({ error: 'Missing id' }) };
      }
      const { session_date, rounds_fired, range_location, notes } = JSON.parse(event.body || '{}');
      if (!session_date || !rounds_fired) {
        return { statusCode: 400, headers: h, body: JSON.stringify({ error: 'session_date and rounds_fired are required' }) };
      }
      if (range_location) {
        await sql`
          INSERT INTO range_locations (name, user_id) VALUES (${range_location}, ${userId})
          ON CONFLICT (name, user_id) DO NOTHING
        `;
      }
      const [session] = await sql`
        UPDATE shooting_sessions
        SET session_date = ${session_date},
            rounds_fired = ${rounds_fired},
            range_location = ${range_location || null},
            notes = ${notes || null}
        WHERE id = ${sessionId}::uuid AND user_id = ${userId}
        RETURNING *
      `;
      return { statusCode: 200, headers: h, body: JSON.stringify(session) };
    }

    if (event.httpMethod === 'DELETE') {
      if (isDemo) return { statusCode: 403, headers: h, body: JSON.stringify({ error: 'Demo mode is read-only' }) };
      const sessionId = event.queryStringParameters?.id;
      if (!sessionId) {
        return { statusCode: 400, headers: h, body: JSON.stringify({ error: 'Missing id' }) };
      }
      await sql`DELETE FROM shooting_sessions WHERE id = ${sessionId}::uuid AND user_id = ${userId}`;
      return { statusCode: 204, headers: h, body: '' };
    }

    return { statusCode: 405, headers: h, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    return { statusCode: 500, headers: h, body: JSON.stringify({ error: err.message }) };
  }
};
