const connectDB = require('../../../lib/db');
const Job = require('../../../models/Job');
const Application = require('../../../models/Application');
const { requireAuth } = require('../../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  await connectDB();
  const { id } = req.query;
  const user = requireAuth(req, res, { role: 'seeker' });
  if (!user) return;
  const job = await Job.findById(id);
  if (!job || job.status !== 'open') return res.status(404).json({ error: 'Job not found or no longer accepting applications' });
  try {
    const application = await Application.create({ job: id, seeker: user.id, resumeUrl: req.body.resumeUrl, coverNote: req.body.coverNote });
    return res.status(201).json({ application });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'You already applied to this job' });
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong, please try again' });
  }
};
