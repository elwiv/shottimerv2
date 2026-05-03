import { neon } from '@neondatabase/serverless';
import { requireUser } from './auth.js';

const sql = neon(process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL);
const h = { 'Content-Type': 'application/json' };

export const handler = async (event, context) => {
  let userId;
  try {
    const user = requireUser(event, context);
    userId = user.sub;
  } catch (authErr) {
    return authErr;
  }

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
      WHERE s.user_id = ${userId}
        AND (${gunId}::UUID IS NULL         OR s.gun_id = ${gunId}::UUID)
        AND (${caliber}::text    IS NULL   OR g.caliber = ${caliber}::text)
        AND (${rangeVal}::text   IS NULL   OR s.range_location = ${rangeVal}::text)
        AND (${startMonth}::text IS NULL   OR TO_CHAR(s.session_date, 'YYYY-MM') >= ${startMonth}::text)
        AND (${endMonth}::text   IS NULL   OR TO_CHAR(s.session_date, 'YYYY-MM') <= ${endMonth}::text)
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
      WHERE s.user_id = ${userId}
        AND (${gunId}::UUID IS NULL         OR s.gun_id = ${gunId}::UUID)
        AND (${caliber}::text    IS NULL   OR g.caliber = ${caliber}::text)
        AND (${rangeVal}::text   IS NULL   OR s.range_location = ${rangeVal}::text)
        AND (${startMonth}::text IS NULL   OR TO_CHAR(s.session_date, 'YYYY-MM') >= ${startMonth}::text)
        AND (${endMonth}::text   IS NULL   OR TO_CHAR(s.session_date, 'YYYY-MM') <= ${endMonth}::text)
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
      WHERE s.user_id = ${userId}
        AND s.range_location IS NOT NULL
        AND (${gunId}::UUID IS NULL         OR s.gun_id = ${gunId}::UUID)
        AND (${caliber}::text    IS NULL   OR g.caliber = ${caliber}::text)
        AND (${startMonth}::text IS NULL   OR TO_CHAR(s.session_date, 'YYYY-MM') >= ${startMonth}::text)
        AND (${endMonth}::text   IS NULL   OR TO_CHAR(s.session_date, 'YYYY-MM') <= ${endMonth}::text)
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
