const connectDB = require('../../lib/db');
const Job = require('../../models/Job');
const { requireAuth } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    // Public: list open jobs, with optional search/filter query params
    const { q, location, category, limit } = req.query;
    const filter = { status: 'open' };

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { companyName: { $regex: q, $options: 'i' } },
      ];
    }
    if (location) {
      filter.$or = [
        ...(filter.$or || []),
        { country: { $regex: location, $options: 'i' } },
        { locationType: { $regex: location, $options: 'i' } },
      ];
    }
    if (category) filter.category = category;

    const max = Math.min(parseInt(limit, 10) || 20, 50);
    const jobs = await Job.find(filter).sort({ createdAt: -1 }).limit(max);
    return res.status(200).json({ jobs });
  }

  if (req.method === 'POST') {
    // Employer only: create a job
    const user = requireAuth(req, res, { role: 'employer' });
    if (!user) return; // requireAuth already sent the error response

    const { title, description, category, type, locationType, country, salaryRange, companyName, companyLogoUrl } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const job = await Job.create({
      employer: user.id,
      title,
      description,
      category,
      type,
      locationType,
      country,
      salaryRange,
      companyName,
      companyLogoUrl,
    });

    return res.status(201).json({ job });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
