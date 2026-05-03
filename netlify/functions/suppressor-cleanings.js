import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL);
const h = { 'Content-Type': 'application/json' };

export const handler = async (event) => {
  try {
    if (event.httpMethod === 'GET') {
      const suppressorId = event.queryStringParameters?.suppressorId || null;
      const logs = await sql`
        SELECT * FROM suppressor_cleaning_logs
        WHERE (${suppressorId}::UUID IS NULL OR suppressor_id = ${suppressorId}::UUID)
        ORDER BY cleaned_at DESC
      `;
      return { statusCode: 200, headers: h, body: JSON.stringify(logs) };
    }

    if (event.httpMethod === 'POST') {
      const { suppressor_id, cleaned_at, notes } = JSON.parse(event.body || '{}');
      if (!suppressor_id || !cleaned_at) {
        return { statusCode: 400, headers: h, body: JSON.stringify({ error: 'suppressor_id and cleaned_at required' }) };
      }
      const [log] = await sql`
        INSERT INTO suppressor_cleaning_logs (suppressor_id, cleaned_at, notes)
        VALUES (${suppressor_id}, ${cleaned_at}, ${notes || null})
        RETURNING *
      `;
      return { statusCode: 201, headers: h, body: JSON.stringify(log) };
    }

    if (event.httpMethod === 'DELETE') {
      const cleaningId = event.queryStringParameters?.id;
      if (!cleaningId) {
        return { statusCode: 400, headers: h, body: JSON.stringify({ error: 'Missing id' }) };
      }
      await sql`DELETE FROM suppressor_cleaning_logs WHERE id = ${cleaningId}::uuid`;
      return { statusCode: 204, headers: h, body: '' };
    }

    return { statusCode: 405, headers: h, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    return { statusCode: 500, headers: h, body: JSON.stringify({ error: err.message }) };
  }
};
