const connectDB = require('../../../lib/db');
const User = require('../../../models/User');
const { requireAuth } = require('../../../lib/auth');

module.exports = async function handler(req, res) {
  await connectDB();
  const admin = requireAuth(req, res, { role: 'admin' });
  if (!admin) return;

  const { id } = req.query;

  if (req.method === 'PATCH') {
    const { status } = req.body;
    if (!['active', 'blocked'].includes(status)) return res.status(400).json({ error: "status must be 'active' or 'blocked'" });
    const user = await User.findByIdAndUpdate(id, { status }, { new: true, fields: '-passwordHash' });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json({ user });
  }

  if (req.method === 'DELETE') {
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
