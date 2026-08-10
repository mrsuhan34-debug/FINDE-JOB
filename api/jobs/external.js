const { fetchExternalJobs } = require('../../lib/externalJobs');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q, location } = req.query;

  try {
    const jobs = await fetchExternalJobs({ q, location });
    return res.status(200).json({ jobs });
  } catch (err) {
    console.error(err);
    return res.status(200).json({ jobs: [] });
  }
};
