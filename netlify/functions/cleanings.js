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
      const gunId = event.queryStringParameters?.gunId || null;
      const logs = await sql`
        SELECT * FROM cleaning_logs
        WHERE user_id = ${userId}
          AND (${gunId}::UUID IS NULL OR gun_id = ${gunId}::UUID)
        ORDER BY cleaned_at DESC
      `;
      return { statusCode: 200, headers: h, body: JSON.stringify(logs) };
    }

    if (event.httpMethod === 'POST') {
      if (isDemo) return { statusCode: 403, headers: h, body: JSON.stringify({ error: 'Demo mode is read-only' }) };
      const { gun_id, cleaned_at, notes } = JSON.parse(event.body || '{}');
      if (!gun_id || !cleaned_at) {
        return { statusCode: 400, headers: h, body: JSON.stringify({ error: 'gun_id and cleaned_at required' }) };
      }
      const [log] = await sql`
        INSERT INTO cleaning_logs (gun_id, cleaned_at, notes, user_id)
        VALUES (${gun_id}, ${cleaned_at}, ${notes || null}, ${userId})
        RETURNING *
      `;
      return { statusCode: 201, headers: h, body: JSON.stringify(log) };
    }

    if (event.httpMethod === 'DELETE') {
      if (isDemo) return { statusCode: 403, headers: h, body: JSON.stringify({ error: 'Demo mode is read-only' }) };
      const cleaningId = event.queryStringParameters?.id;
      if (!cleaningId) {
        return { statusCode: 400, headers: h, body: JSON.stringify({ error: 'Missing id' }) };
      }
      await sql`DELETE FROM cleaning_logs WHERE id = ${cleaningId}::uuid AND user_id = ${userId}`;
      return { statusCode: 204, headers: h, body: '' };
    }

    return { statusCode: 405, headers: h, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    return { statusCode: 500, headers: h, body: JSON.stringify({ error: err.message }) };
  }
};
