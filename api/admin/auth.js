const jwt = require('jsonwebtoken');

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE;
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { passcode } = req.body;
  if (!passcode || passcode !== ADMIN_PASSCODE) {
    return res.status(401).json({ error: 'Incorrect passcode' });
  }

  // Short-lived admin session token — not tied to any specific user account
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
  return res.status(200).json({ token });
};
