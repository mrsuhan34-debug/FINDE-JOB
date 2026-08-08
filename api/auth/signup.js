const bcrypt = require('bcryptjs');
const connectDB = require('../../lib/db');
const User = require('../../models/User');
const { signToken } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    await connectDB();
    const { name, email, password, role, companyName } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
    if (role && !['seeker', 'employer'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'An account with this email already exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash, role: role || 'seeker', companyName: role === 'employer' ? companyName : undefined });
    const token = signToken(user);
    return res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong, please try again' });
  }
};
