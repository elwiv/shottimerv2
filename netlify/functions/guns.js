import { neon } from '@netlify/neon';

const sql = neon();
const h = { 'Content-Type': 'application/json' };

export const handler = async (event) => {
  try {
    if (event.httpMethod === 'GET') {
      const guns = await sql`SELECT * FROM guns ORDER BY created_at DESC`;
      return { statusCode: 200, headers: h, body: JSON.stringify(guns) };
    }

    if (event.httpMethod === 'POST') {
      const { name, caliber, photo_url } = JSON.parse(event.body || '{}');
      if (!name || !caliber) {
        return { statusCode: 400, headers: h, body: JSON.stringify({ error: 'name and caliber required' }) };
      }
      const [gun] = await sql`
        INSERT INTO guns (name, caliber, photo_url)
        VALUES (${name}, ${caliber}, ${photo_url || null})
        RETURNING *
      `;
      return { statusCode: 201, headers: h, body: JSON.stringify(gun) };
    }

    return { statusCode: 405, headers: h, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    return { statusCode: 500, headers: h, body: JSON.stringify({ error: err.message }) };
  }
};
