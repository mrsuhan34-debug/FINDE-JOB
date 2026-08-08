const connectDB = require('../../lib/db');
const Job = require('../../models/Job');
const { requireAuth } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  await connectDB();
  const { id } = req.query;
  if (req.method === 'GET') {
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    return res.status(200).json({ job });
  }
  if (req.method === 'PUT') {
    const user = requireAuth(req, res, { role: 'employer' });
    if (!user) return;
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (String(job.employer) !== String(user.id)) return res.status(403).json({ error: 'You can only edit your own job posts' });
    Object.assign(job, req.body);
    await job.save();
    return res.status(200).json({ job });
  }
  if (req.method === 'DELETE') {
    const user = requireAuth(req, res, { role: 'employer' });
    if (!user) return;
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (String(job.employer) !== String(user.id)) return res.status(403).json({ error: 'You can only delete your own job posts' });
    await job.deleteOne();
    return res.status(200).json({ success: true });
  }
  return res.status(405).json({ error: 'Method not allowed' });
};
