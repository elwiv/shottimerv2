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
      const suppressorId = event.queryStringParameters?.suppressorId || null;
      const logs = await sql`
        SELECT * FROM suppressor_cleaning_logs
        WHERE user_id = ${userId}
          AND (${suppressorId}::UUID IS NULL OR suppressor_id = ${suppressorId}::UUID)
        ORDER BY cleaned_at DESC
      `;
      return { statusCode: 200, headers: h, body: JSON.stringify(logs) };
    }

    if (event.httpMethod === 'POST') {
      if (isDemo) return { statusCode: 403, headers: h, body: JSON.stringify({ error: 'Demo mode is read-only' }) };
      const { suppressor_id, cleaned_at, notes } = JSON.parse(event.body || '{}');
      if (!suppressor_id || !cleaned_at) {
        return { statusCode: 400, headers: h, body: JSON.stringify({ error: 'suppressor_id and cleaned_at required' }) };
      }
      const [log] = await sql`
        INSERT INTO suppressor_cleaning_logs (suppressor_id, cleaned_at, notes, user_id)
        VALUES (${suppressor_id}, ${cleaned_at}, ${notes || null}, ${userId})
        RETURNING *
      `;
      return { statusCode: 201, headers: h, body: JSON.stringify(log) };
    }

    if (event.httpMethod === 'PUT') {
      if (isDemo) return { statusCode: 403, headers: h, body: JSON.stringify({ error: 'Demo mode is read-only' }) };
      const cleaningId = event.queryStringParameters?.id;
      if (!cleaningId) {
        return { statusCode: 400, headers: h, body: JSON.stringify({ error: 'Missing id' }) };
      }
      const { cleaned_at, notes } = JSON.parse(event.body || '{}');
      if (!cleaned_at) {
        return { statusCode: 400, headers: h, body: JSON.stringify({ error: 'cleaned_at is required' }) };
      }
      const [log] = await sql`
        UPDATE suppressor_cleaning_logs
        SET cleaned_at = ${cleaned_at}, notes = ${notes || null}
        WHERE id = ${cleaningId}::uuid AND user_id = ${userId}
        RETURNING *
      `;
      return { statusCode: 200, headers: h, body: JSON.stringify(log) };
    }

    if (event.httpMethod === 'DELETE') {
      if (isDemo) return { statusCode: 403, headers: h, body: JSON.stringify({ error: 'Demo mode is read-only' }) };
      const cleaningId = event.queryStringParameters?.id;
      if (!cleaningId) {
        return { statusCode: 400, headers: h, body: JSON.stringify({ error: 'Missing id' }) };
      }
      await sql`DELETE FROM suppressor_cleaning_logs WHERE id = ${cleaningId}::uuid AND user_id = ${userId}`;
      return { statusCode: 204, headers: h, body: '' };
    }

    return { statusCode: 405, headers: h, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    return { statusCode: 500, headers: h, body: JSON.stringify({ error: err.message }) };
  }
};
