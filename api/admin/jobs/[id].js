const connectDB = require('../../../lib/db');
const Job = require('../../../models/Job');
const { requireAuth } = require('../../../lib/auth');

module.exports = async function handler(req, res) {
  await connectDB();
  const admin = requireAuth(req, res, { role: 'admin' });
  if (!admin) return;
  const { id } = req.query;
  if (req.method === 'PATCH') {
    const { status } = req.body;
    if (!['hidden', 'open', 'closed'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const job = await Job.findByIdAndUpdate(id, { status }, { new: true });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    return res.status(200).json({ job });
  }
  if (req.method === 'DELETE') {
    const job = await Job.findByIdAndDelete(id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    return res.status(200).json({ success: true });
  }
  return res.status(405).json({ error: 'Method not allowed' });
};
