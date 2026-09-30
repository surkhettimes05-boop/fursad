const crypto = require('crypto');

const REPO = process.env.GITHUB_REPO || 'surkhettimes05-boop/fursad';
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const TOKEN = process.env.GITHUB_TOKEN || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const API = 'https://api.github.com/repos/' + REPO;

function safeEqual(a, b) {
  const x = Buffer.from(String(a || ''));
  const y = Buffer.from(String(b || ''));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

function send(res, status, payload) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(payload);
}

async function gh(path, options = {}) {
  if (!TOKEN) throw new Error('GITHUB_TOKEN is not configured');
  const response = await fetch(API + path, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: 'Bearer ' + TOKEN,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || ('GitHub API ' + response.status));
  return data;
}

function validateContent(content) {
  if (!content || typeof content !== 'object') throw new Error('Invalid content payload');
  for (const key of ['offers', 'partners', 'reviews', 'media']) {
    if (!Array.isArray(content[key])) throw new Error(key + ' must be an array');
    if (content[key].length > 100) throw new Error(key + ' exceeds the 100-item limit');
  }
  if (!content.settings || typeof content.settings !== 'object') throw new Error('settings must be an object');
  return content;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  if (!ADMIN_PASSWORD) return send(res, 503, { error: 'ADMIN_PASSWORD is not configured in Vercel' });
  if (!safeEqual(req.headers['x-admin-password'], ADMIN_PASSWORD)) return send(res, 401, { error: 'Invalid admin password' });

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (_) { return send(res, 400, { error: 'Invalid JSON' }); }
  }

  try {
    if (body.action === 'authenticate') return send(res, 200, { ok: true });

    if (body.action === 'saveContent') {
      const content = validateContent(body.content);
      const existing = await gh('/contents/data/content.json?ref=' + encodeURIComponent(BRANCH));
      const serialized = JSON.stringify(content, null, 2) + '\n';
      const result = await gh('/contents/data/content.json', {
        method: 'PUT',
        body: JSON.stringify({
          message: 'content: update FURSAD website via admin',
          content: Buffer.from(serialized).toString('base64'),
          sha: existing.sha,
          branch: BRANCH
        })
      });
      return send(res, 200, { ok: true, commit: result.commit && result.commit.sha });
    }

    if (body.action === 'uploadMedia') {
      const match = String(body.dataUrl || '').match(/^data:(image\/(?:png|jpeg|webp|gif)|video\/mp4);base64,([A-Za-z0-9+/=]+)$/);
      if (!match) return send(res, 400, { error: 'Unsupported media type' });
      const buffer = Buffer.from(match[2], 'base64');
      if (buffer.length > 3 * 1024 * 1024) return send(res, 400, { error: 'File must be 3 MB or smaller' });

      const extMap = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'video/mp4': 'mp4' };
      const base = String(body.name || 'media')
        .replace(/\.[^.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 60) || 'media';
      const filePath = 'assets/uploads/' + Date.now() + '-' + base + '.' + extMap[match[1]];

      await gh('/contents/' + filePath, {
        method: 'PUT',
        body: JSON.stringify({
          message: 'content: upload FURSAD media',
          content: buffer.toString('base64'),
          branch: BRANCH
        })
      });
      return send(res, 200, { ok: true, path: '/' + filePath });
    }

    return send(res, 400, { error: 'Unknown action' });
  } catch (error) {
    return send(res, 500, { error: error.message || 'Server error' });
  }
};
