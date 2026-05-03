const h = { 'Content-Type': 'application/json' };

export function requireUser(event, context) {
  // Demo token bypass: 'demo' is not a real JWT, handle before clientContext check
  const authHeader = event.headers?.authorization || event.headers?.Authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (token === 'demo') {
    return { sub: 'demo-user', email: 'demo@example.com' };
  }

  // For real JWTs, Netlify validates the token and populates context.clientContext.user
  const user = context.clientContext?.user;
  if (!user) throw { statusCode: 401, headers: h, body: JSON.stringify({ error: 'Unauthorized' }) };
  return user; // { sub, email, app_metadata, ... }
}
