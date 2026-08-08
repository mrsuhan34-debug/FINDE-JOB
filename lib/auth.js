const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role, status: user.status }, JWT_SECRET, { expiresIn: '7d' });
}
function verifyToken(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}
function requireAuth(req, res, opts = {}) {
  const decoded = verifyToken(req);
  if (!decoded) { res.status(401).json({ error: 'Not authenticated' }); return null; }
  if (decoded.status === 'blocked') { res.status(403).json({ error: 'This account has been blocked' }); return null; }
  if (opts.role && decoded.role !== opts.role) { res.status(403).json({ error: 'Not authorized for this action' }); return null; }
  return decoded;
}
module.exports = { signToken, verifyToken, requireAuth };
