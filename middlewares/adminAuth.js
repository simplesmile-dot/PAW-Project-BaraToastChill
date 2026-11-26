// Middleware autentikasi sederhana untuk halaman dan API admin/dapur
// Memakai cookie bertanda tangan HMAC-SHA256 menggunakan modul bawaan Node.js (crypto).
const crypto = require('crypto');
const config = require('../config');

const COOKIE_NAME = 'bara_admin_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 jam

const sign = (payloadBase64) =>
  crypto.createHmac('sha256', config.admin.secret).update(payloadBase64).digest('base64url');

const parseCookies = (cookieHeader) => {
  const result = {};
  if (!cookieHeader || typeof cookieHeader !== 'string') return result;

  cookieHeader.split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) {
      try {
        result[key] = decodeURIComponent(val);
      } catch (e) {
        result[key] = val;
      }
    }
  });
  return result;
};

const createToken = (username) => {
  const payload = {
    u: username,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  return `${encoded}.${sign(encoded)}`;
};

const verifyToken = (token) => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encoded, signature] = parts;
  const expectedSig = sign(encoded);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSig);

  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (!payload || typeof payload.exp !== 'number' || payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch (err) {
    return null;
  }
};

const getAdminSession = (req) => {
  const cookies = parseCookies(req.headers.cookie);
  return verifyToken(cookies[COOKIE_NAME]);
};

const setAdminSession = (res, username) => {
  const token = createToken(username);
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: SESSION_TTL_MS,
    path: '/',
  });
};

const clearAdminSession = (res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' });
};

const requireAdminPage = (req, res, next) => {
  const session = getAdminSession(req);
  if (!session) {
    return res.redirect('/admin/login');
  }
  req.adminUser = session.u;
  next();
};

const requireAdminApi = (req, res, next) => {
  const session = getAdminSession(req);
  if (!session) {
    return res.status(401).json({
      pesan: 'Akses ditolak. Silakan login sebagai admin terlebih dahulu.',
    });
  }
  req.adminUser = session.u;
  next();
};

module.exports = {
  getAdminSession,
  setAdminSession,
  clearAdminSession,
  requireAdminPage,
  requireAdminApi,
};
