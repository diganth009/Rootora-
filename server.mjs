import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';

const PORT = Number(process.env.PORT || 3000);
const API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const ROOT = resolve(process.cwd());
const system = `You are Rootora AI, the helpful assistant inside Rootora, an everyday-life platform. Help with home and product guidance, local discovery, farming education, small-business tools, and using the Rootora website. Be practical, friendly, concise, and honest. Never invent live prices, opening hours, ratings, listings, sales, or local conditions. Ask clarifying questions when needed. For crop/pesticide decisions, emphasize local expert advice and label directions. You cannot access private accounts, browse live listings, or perform actions unless a tool is explicitly provided.`;

function sendJson(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(value));
}

const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');

  if (req.method === 'GET' && req.url?.split('?')[0] === '/api/health') {
    return sendJson(res, 200, { ok: true, aiConfigured: Boolean(API_KEY), model: MODEL });
  }

  if (req.method === 'POST' && req.url?.split('?')[0] === '/api/chat') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 100_000) {
        sendJson(res, 413, { error: 'Message is too large. Please shorten it.' });
        req.destroy();
      }
    });
    req.on('end', async () => {
      try {
        if (!API_KEY) return sendJson(res, 503, { error: 'The server is running, but no OpenAI API key is configured. Add OPENAI_API_KEY on the server to activate real AI.' });
        const data = JSON.parse(body || '{}');
        const messages = Array.isArray(data.messages)
          ? data.messages.filter(m => ['user', 'assistant'].includes(m?.role) && typeof m?.content === 'string').slice(-12)
          : [];
        if (!messages.length) return sendJson(res, 400, { error: 'Please send a message.' });
        const api = await fetch('https://api.openai.com/v1/responses', {
          method: 'POST',
          headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: MODEL, instructions: system, input: messages.map(m => ({ role: m.role, content: m.content.slice(0, 4000) })), max_output_tokens: 700 })
        });
        const result = await api.json().catch(() => ({}));
        if (!api.ok) {
          const status = api.status === 401 ? 502 : api.status;
          return sendJson(res, status, { error: result.error?.message || `AI provider request failed (HTTP ${api.status}). Check the server API key, billing, and model access.` });
        }
        const reply = (result.output || []).flatMap(item => item.content || []).filter(item => item.type === 'output_text').map(item => item.text).join('\n').trim();
        return sendJson(res, 200, { reply: reply || 'I could not create a reply. Please try again.' });
      } catch (error) {
        return sendJson(res, 400, { error: 'Invalid request or AI service unavailable. Please try again.' });
      }
    });
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD, POST', 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Method not allowed');
  }

  let pathname;
  try { pathname = decodeURIComponent((req.url || '/').split('?')[0]); }
  catch { res.writeHead(400); return res.end('Bad request'); }
  if (pathname === '/') pathname = '/index.html';
  const relative = normalize(pathname).replace(/^([.][.][/\\])+/, '').replace(/^[/\\]+/, '');
  const file = resolve(ROOT, relative);
  if (file !== ROOT && !file.startsWith(ROOT + sep)) {
    res.writeHead(403); return res.end('Forbidden');
  }
  try {
    const data = await readFile(file);
    const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ico': 'image/x-icon' };
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
});

server.listen(PORT, '0.0.0.0', () => console.log(`Rootora is running at http://localhost:${PORT}\nAI model: ${MODEL}\nAPI key configured: ${Boolean(API_KEY)}\nKeep this window open while testing. Press Ctrl+C to stop.`));
