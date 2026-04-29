import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL);
const h = { 'Content-Type': 'application/json' };

export const handler = async (event) => {
  // Extract gun UUID: check query params first, then parse from the original URL
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
      const [gun] = await sql`SELECT * FROM guns WHERE id = ${id}`;
      if (!gun) return { statusCode: 404, headers: h, body: JSON.stringify({ error: 'Not found' }) };

      const [totals] = await sql`
        SELECT
          COALESCE(SUM(rounds_fired), 0)::int AS total_rounds,
          COUNT(*)::int AS total_sessions
        FROM shooting_sessions WHERE gun_id = ${id}::uuid
      `;

      const [lastClean] = await sql`
        SELECT cleaned_at FROM cleaning_logs
        WHERE gun_id = ${id}::uuid ORDER BY cleaned_at DESC LIMIT 1
      `;

      const [sinceCleaning] = await sql`
        SELECT COALESCE(SUM(rounds_fired), 0)::int AS rounds
        FROM shooting_sessions
        WHERE gun_id = ${id}::uuid
          AND session_date > COALESCE(
            (SELECT cleaned_at FROM cleaning_logs WHERE gun_id = ${id}::uuid ORDER BY cleaned_at DESC LIMIT 1),
            '1900-01-01'::DATE
          )
      `;

      const monthly = await sql`
        SELECT
          TO_CHAR(session_date, 'YYYY-MM') AS month,
          SUM(rounds_fired)::int AS rounds,
          COUNT(*)::int AS sessions,
          STRING_AGG(DISTINCT range_location, ', ')
            FILTER (WHERE range_location IS NOT NULL) AS ranges
        FROM shooting_sessions
        WHERE gun_id = ${id}::uuid
        GROUP BY TO_CHAR(session_date, 'YYYY-MM')
        ORDER BY month DESC
      `;

      const sessions = await sql`
        SELECT id, session_date, rounds_fired, range_location, notes
        FROM shooting_sessions
        WHERE gun_id = ${id}::uuid
        ORDER BY session_date DESC, created_at DESC
      `;

      const cleanings = await sql`
        SELECT id, cleaned_at, notes
        FROM cleaning_logs
        WHERE gun_id = ${id}::uuid
        ORDER BY cleaned_at DESC
      `;

      return {
        statusCode: 200, headers: h,
        body: JSON.stringify({
          ...gun,
          stats: {
            total_rounds: totals.total_rounds + (gun.base_round_count || 0),
            session_rounds: totals.total_rounds,
            total_sessions: totals.total_sessions,
            rounds_since_cleaning: sinceCleaning.rounds,
            last_cleaned: lastClean?.cleaned_at || null,
          },
          monthly,
          sessions,
          cleanings,
        }),
      };
    }

    if (event.httpMethod === 'PUT') {
      const { name, caliber, brand, photo_url, base_round_count } = JSON.parse(event.body || '{}');
      if (!name || !caliber) {
        return { statusCode: 400, headers: h, body: JSON.stringify({ error: 'name and caliber required' }) };
      }
      const [gun] = await sql`
        UPDATE guns SET name = ${name}, caliber = ${caliber}, brand = ${brand || null},
          photo_url = ${photo_url || null}, base_round_count = ${parseInt(base_round_count) || 0}
        WHERE id = ${id} RETURNING *
      `;
      if (!gun) return { statusCode: 404, headers: h, body: JSON.stringify({ error: 'Not found' }) };
      return { statusCode: 200, headers: h, body: JSON.stringify(gun) };
    }

    if (event.httpMethod === 'DELETE') {
      await sql`DELETE FROM guns WHERE id = ${id}`;
      return { statusCode: 204, headers: h, body: '' };
    }

    return { statusCode: 405, headers: h, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    return { statusCode: 500, headers: h, body: JSON.stringify({ error: err.message }) };
  }
};
