import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL);
const h = { 'Content-Type': 'application/json' };

export const handler = async (event) => {
  try {
    const q          = event.queryStringParameters || {};
    const gunId      = q.gunId      || null;
    const caliber    = q.caliber    || null;
    const rangeVal   = q.range      || null;
    const startMonth = q.startMonth || null;
    const endMonth   = q.endMonth   || null;

    const byGun = await sql`
      SELECT
        TO_CHAR(s.session_date, 'YYYY-MM') AS month,
        g.id   AS gun_id,
        g.name AS gun_name,
        g.caliber,
        STRING_AGG(DISTINCT s.range_location, ', ')
          FILTER (WHERE s.range_location IS NOT NULL) AS ranges,
        SUM(s.rounds_fired)::int  AS rounds_fired,
        COUNT(s.id)::int          AS session_count,
        MAX(s.session_date)       AS last_session_date
      FROM shooting_sessions s
      JOIN guns g ON s.gun_id = g.id
      WHERE (${gunId}::UUID IS NULL    OR s.gun_id = ${gunId}::UUID)
        AND (${caliber}    IS NULL     OR g.caliber = ${caliber})
        AND (${rangeVal}   IS NULL     OR s.range_location = ${rangeVal})
        AND (${startMonth} IS NULL     OR TO_CHAR(s.session_date, 'YYYY-MM') >= ${startMonth})
        AND (${endMonth}   IS NULL     OR TO_CHAR(s.session_date, 'YYYY-MM') <= ${endMonth})
      GROUP BY TO_CHAR(s.session_date, 'YYYY-MM'), g.id, g.name, g.caliber
      ORDER BY month DESC, g.name
    `;

    const [summary] = await sql`
      SELECT
        COALESCE(SUM(s.rounds_fired), 0)::int                                          AS total_rounds,
        COUNT(s.id)::int                                                                AS total_sessions,
        COUNT(DISTINCT s.gun_id)::int                                                   AS unique_guns,
        COUNT(DISTINCT s.range_location) FILTER (WHERE s.range_location IS NOT NULL)::int AS ranges_visited
      FROM shooting_sessions s
      JOIN guns g ON s.gun_id = g.id
      WHERE (${gunId}::UUID IS NULL    OR s.gun_id = ${gunId}::UUID)
        AND (${caliber}    IS NULL     OR g.caliber = ${caliber})
        AND (${rangeVal}   IS NULL     OR s.range_location = ${rangeVal})
        AND (${startMonth} IS NULL     OR TO_CHAR(s.session_date, 'YYYY-MM') >= ${startMonth})
        AND (${endMonth}   IS NULL     OR TO_CHAR(s.session_date, 'YYYY-MM') <= ${endMonth})
    `;

    const rangeBreakdown = await sql`
      SELECT
        s.range_location,
        COUNT(DISTINCT s.id)::int   AS total_visits,
        SUM(s.rounds_fired)::int    AS total_rounds,
        COUNT(DISTINCT s.gun_id)::int AS guns_used,
        MAX(s.session_date)         AS last_visited
      FROM shooting_sessions s
      JOIN guns g ON s.gun_id = g.id
      WHERE s.range_location IS NOT NULL
        AND (${gunId}::UUID IS NULL OR s.gun_id = ${gunId}::UUID)
        AND (${caliber}    IS NULL  OR g.caliber = ${caliber})
        AND (${startMonth} IS NULL  OR TO_CHAR(s.session_date, 'YYYY-MM') >= ${startMonth})
        AND (${endMonth}   IS NULL  OR TO_CHAR(s.session_date, 'YYYY-MM') <= ${endMonth})
      GROUP BY s.range_location
      ORDER BY total_rounds DESC
    `;

    return {
      statusCode: 200, headers: h,
      body: JSON.stringify({ summary, byGun, rangeBreakdown }),
    };
  } catch (err) {
    return { statusCode: 500, headers: h, body: JSON.stringify({ error: err.message }) };
  }
};
