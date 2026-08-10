// Fetches live job listings from an external provider so real postings from
// big companies (Google, Microsoft, Amazon, etc.) can show up alongside
// jobs posted directly on JobNest.
//
// Adzuna is tried first. If it fails for ANY reason — not configured yet,
// rate-limited, free-tier quota exhausted, network error — it automatically
// falls back to Jooble. If both fail, it returns an empty array instead of
// breaking the page.

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;
const ADZUNA_COUNTRY = process.env.ADZUNA_COUNTRY || 'us'; // e.g. us, gb, in, au...
const JOOBLE_API_KEY = process.env.JOOBLE_API_KEY;

function guessLocationType(title, text, location) {
  const blob = `${title || ''} ${text || ''} ${location || ''}`.toLowerCase();
  if (blob.includes('remote')) return 'Remote';
  if (blob.includes('hybrid')) return 'Hybrid';
  return 'On-site';
}

async function fetchFromAdzuna({ q, location }) {
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    throw new Error('Adzuna not configured (missing ADZUNA_APP_ID/ADZUNA_APP_KEY)');
  }

  const params = new URLSearchParams({
    app_id: ADZUNA_APP_ID,
    app_key: ADZUNA_APP_KEY,
    results_per_page: '12',
    'content-type': 'application/json',
  });
  if (q) params.set('what', q);
  if (location) params.set('where', location);

  const url = `https://api.adzuna.com/v1/api/jobs/${ADZUNA_COUNTRY}/search/1?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const bodyText = await res.text().catch(() => '');
    throw new Error(`Adzuna responded with ${res.status}${bodyText ? `: ${bodyText.slice(0, 200)}` : ''}`);
  }
  const data = await res.json();

  return (data.results || []).map((j) => ({
    _id: `adzuna_${j.id}`,
    title: j.title,
    companyName: j.company?.display_name || 'Unknown Company',
    description: j.description || '',
    category: j.category?.label || '',
    type: j.contract_time === 'part_time' ? 'Part-time' : 'Full-time',
    locationType: guessLocationType(j.title, j.description, j.location?.display_name),
    country: j.location?.display_name || '',
    salaryRange: j.salary_min
      ? `${Math.round(j.salary_min).toLocaleString()} - ${Math.round(j.salary_max || j.salary_min).toLocaleString()}`
      : '',
    applyUrl: j.redirect_url,
    source: 'external',
    provider: 'Adzuna',
  }));
}

async function fetchFromJooble({ q, location }) {
  if (!JOOBLE_API_KEY) {
    throw new Error('Jooble not configured (missing JOOBLE_API_KEY)');
  }

  // Jooble rejects a fully empty request — fall back to a broad keyword
  // so an unfiltered "show me jobs" call still returns something.
  const keywords = q || (location ? '' : 'jobs');

  const res = await fetch(`https://jooble.org/api/${JOOBLE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keywords, location: location || '' }),
  });
  if (!res.ok) {
    const bodyText = await res.text().catch(() => '');
    throw new Error(`Jooble responded with ${res.status}${bodyText ? `: ${bodyText.slice(0, 200)}` : ''}`);
  }
  const data = await res.json();

  return (data.jobs || []).slice(0, 12).map((j, idx) => ({
    _id: `jooble_${idx}_${Buffer.from(j.link || j.title || String(idx)).toString('base64').slice(0, 12)}`,
    title: j.title,
    companyName: j.company || 'Unknown Company',
    description: j.snippet || '',
    category: '',
    type: j.type || 'Full-time',
    locationType: guessLocationType(j.title, j.snippet, j.location),
    country: j.location || '',
    salaryRange: j.salary || '',
    applyUrl: j.link,
    source: 'external',
    provider: 'Jooble',
  }));
}

async function fetchExternalJobs(params) {
  try {
    return await fetchFromAdzuna(params);
  } catch (err) {
    console.warn('[externalJobs] Adzuna failed, falling back to Jooble:', err.message);
    try {
      return await fetchFromJooble(params);
    } catch (err2) {
      console.warn('[externalJobs] Jooble also failed:', err2.message);
      return [];
    }
  }
}

module.exports = { fetchExternalJobs };
