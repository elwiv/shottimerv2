import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NETLIFY_DATABASE_URL);
const h = { 'Content-Type': 'application/json' };

export const handler = async (event) => {
  try {
    if (event.httpMethod === 'GET') {
      const gunId = event.queryStringParameters?.gunId || null;
      const logs = await sql`
        SELECT * FROM cleaning_logs
        WHERE (${gunId}::UUID IS NULL OR gun_id = ${gunId}::UUID)
        ORDER BY cleaned_at DESC
      `;
      return { statusCode: 200, headers: h, body: JSON.stringify(logs) };
    }

    if (event.httpMethod === 'POST') {
      const { gun_id, cleaned_at, notes } = JSON.parse(event.body || '{}');
      if (!gun_id || !cleaned_at) {
        return { statusCode: 400, headers: h, body: JSON.stringify({ error: 'gun_id and cleaned_at required' }) };
      }
      const [log] = await sql`
        INSERT INTO cleaning_logs (gun_id, cleaned_at, notes)
        VALUES (${gun_id}, ${cleaned_at}, ${notes || null})
        RETURNING *
      `;
      return { statusCode: 201, headers: h, body: JSON.stringify(log) };
    }

    return { statusCode: 405, headers: h, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    return { statusCode: 500, headers: h, body: JSON.stringify({ error: err.message }) };
  }
};
