import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL);
const h = { 'Content-Type': 'application/json' };

export const handler = async (event) => {
  let id = event.queryStringParameters?.id;
  if (!id) {
    try {
      const pathname = new URL(event.rawUrl).pathname;
      id = pathname.split('/').find(
        s => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
      );
    } catch {}
  }
  if (!id) return { statusCode: 400, headers: h, body: JSON.stringify({ error: 'Missing id' }) };

  try {
    if (event.httpMethod === 'GET') {
      const [sup] = await sql`SELECT * FROM suppressors WHERE id = ${id}`;
      if (!sup) return { statusCode: 404, headers: h, body: JSON.stringify({ error: 'Not found' }) };

      const [totals] = await sql`
        SELECT
          COALESCE(SUM(rounds_fired), 0)::int AS total_shots,
          COUNT(*)::int AS total_sessions
        FROM shooting_sessions WHERE suppressor_id = ${id}::uuid
      `;

      const [lastClean] = await sql`
        SELECT cleaned_at FROM suppressor_cleaning_logs
        WHERE suppressor_id = ${id}::uuid ORDER BY cleaned_at DESC LIMIT 1
      `;

      const [sinceCleaning] = await sql`
        SELECT COALESCE(SUM(rounds_fired), 0)::int AS shots
        FROM shooting_sessions
        WHERE suppressor_id = ${id}::uuid
          AND session_date > COALESCE(
            (SELECT cleaned_at FROM suppressor_cleaning_logs WHERE suppressor_id = ${id}::uuid ORDER BY cleaned_at DESC LIMIT 1),
            '1900-01-01'::DATE
          )
      `;

      const sessions = await sql`
        SELECT s.id, s.session_date, s.rounds_fired, s.range_location, g.name AS gun_name, g.caliber AS gun_caliber
        FROM shooting_sessions s
        LEFT JOIN guns g ON s.gun_id = g.id
        WHERE s.suppressor_id = ${id}::uuid
        ORDER BY s.session_date DESC, s.created_at DESC
      `;

      const cleanings = await sql`
        SELECT id, cleaned_at, notes
        FROM suppressor_cleaning_logs
        WHERE suppressor_id = ${id}::uuid
        ORDER BY cleaned_at DESC
      `;

      return {
        statusCode: 200, headers: h,
        body: JSON.stringify({
          ...sup,
          stats: {
            total_shots: totals.total_shots + (sup.base_shot_count || 0),
            session_shots: totals.total_shots,
            total_sessions: totals.total_sessions,
            shots_since_cleaning: sinceCleaning.shots,
            last_cleaned: lastClean?.cleaned_at || null,
          },
          sessions,
          cleanings,
        }),
      };
    }

    if (event.httpMethod === 'PUT') {
      const { name, calibers, brand, base_shot_count } = JSON.parse(event.body || '{}');
      if (!name || !calibers || !calibers.length) {
        return { statusCode: 400, headers: h, body: JSON.stringify({ error: 'name and calibers required' }) };
      }
      const [sup] = await sql`
        UPDATE suppressors SET name = ${name}, calibers = ${calibers},
          brand = ${brand || null}, base_shot_count = ${parseInt(base_shot_count) || 0}
        WHERE id = ${id} RETURNING *
      `;
      if (!sup) return { statusCode: 404, headers: h, body: JSON.stringify({ error: 'Not found' }) };
      return { statusCode: 200, headers: h, body: JSON.stringify(sup) };
    }

    if (event.httpMethod === 'DELETE') {
      await sql`DELETE FROM suppressors WHERE id = ${id}`;
      return { statusCode: 204, headers: h, body: '' };
    }

    return { statusCode: 405, headers: h, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    return { statusCode: 500, headers: h, body: JSON.stringify({ error: err.message }) };
  }
};
