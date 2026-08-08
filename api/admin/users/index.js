const connectDB = require('../../../lib/db');
const User = require('../../../models/User');
const { requireAuth } = require('../../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  await connectDB();
  const admin = requireAuth(req, res, { role: 'admin' });
  if (!admin) return;
  const users = await User.find({}, '-passwordHash').sort({ createdAt: -1 }).limit(200);
  return res.status(200).json({ users });
};
