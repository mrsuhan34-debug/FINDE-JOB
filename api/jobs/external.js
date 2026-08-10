const { fetchExternalJobs } = require('../../lib/externalJobs');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q, location, limit } = req.query;

  try {
    const jobs = await fetchExternalJobs({ q, location, limit: parseInt(limit, 10) || undefined });
    return res.status(200).json({ jobs });
  } catch (err) {
    // Should rarely hit this — fetchExternalJobs already catches its own
    // errors — but never let this break the page either way.
    console.error(err);
    return res.status(200).json({ jobs: [] });
  }
};
