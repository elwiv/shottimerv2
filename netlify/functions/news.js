// Fetches TFB RSS feed server-side to avoid CORS, parses with regex, returns JSON.
// No new npm dependencies required.

const RSS_URL = 'https://www.thefirearmblog.com/blog/feed/';

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'public, max-age=600',
};

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: HEADERS, body: '' };
  }

  try {
    const res = await fetch(RSS_URL, {
      headers: { 'User-Agent': 'Chambered-App/1.0' },
    });
    if (!res.ok) throw new Error(`RSS fetch failed: HTTP ${res.status}`);
    const xml = await res.text();
    const articles = parseRss(xml).slice(0, 20);
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ articles }) };
  } catch (e) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: e.message }) };
  }
};

function parseRss(xml) {
  const itemPattern = /<item>([\s\S]*?)<\/item>/g;
  const articles = [];
  let match;

  while ((match = itemPattern.exec(xml)) !== null) {
    const item = match[1];

    const title   = extractFirst(item, /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
    const link    = extractFirst(item, /<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/);
    const pubDate = extractFirst(item, /<pubDate>([\s\S]*?)<\/pubDate>/);

    // Image: try media:content, then enclosure, then first <img> in description
    const mediaImg     = extractFirst(item, /<media:content[^>]+url="([^"]+)"/);
    const enclosureImg = extractFirst(item, /<enclosure[^>]+url="([^"]+)"[^>]+type="image[^"]*"/);
    const descContent  = extractFirst(item, /<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/);
    const inlineImg    = descContent ? extractFirst(descContent, /<img[^>]+src="([^"]+)"/) : null;

    if (!title || !link) continue;

    const image = mediaImg || enclosureImg || inlineImg || null;

    articles.push({
      title:   decodeEntities(title.trim()),
      link:    link.trim(),
      pubDate: pubDate ? pubDate.trim() : null,
      image:   image   ? decodeEntities(image.trim()) : null,
    });
  }

  return articles;
}

function extractFirst(str, regex) {
  const m = regex.exec(str);
  return m ? m[1] : null;
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g,  '&')
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
}
