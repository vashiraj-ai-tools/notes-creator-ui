/**
 * Centralised API client for the Notes Creator backend.
 * Change API_BASE_URL here if the server port or host changes.
 */
const API_BASE_URL = 'http://127.0.0.1:8080';

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes max

/** Submit a new notes-generation job. Returns { job_id, status }. */
export async function submitJob(url, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/api/jobs/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ url }),
  });

  const data = await res.json();

  if (!res.ok) {
    // FastAPI validation errors have a `detail` array
    const msg = Array.isArray(data.detail)
      ? data.detail.map((d) => d.msg).join(', ')
      : data.detail || 'Failed to submit job';
    throw new Error(msg);
  }

  return data; // { job_id, status }
}

/** Poll job status until it is completed or failed. Returns the status object. */
export async function pollJobStatus(jobId, onStatusUpdate, token) {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  while (Date.now() < deadline) {
    const res = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, { headers });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || 'Failed to fetch job status');
    }

    onStatusUpdate?.(data);

    if (data.status === 'completed') return data;
    if (data.status === 'failed') {
      throw new Error(data.error || 'Job failed with no details');
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }

  throw new Error('Job timed out. Please try again.');
}

/** Fetch the final notes result for a completed job. */
export async function fetchJobResult(jobId, token) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/result`, { headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || 'Failed to fetch notes');
  }

  return data; // { notes, source: { title, type } }
}

/** Fetch user profile */
export async function getUserProfile(token) {
  if (!token) return null;
  const res = await fetch(`${API_BASE_URL}/users/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

/** Save updated Gemini API Key */
export async function saveApiKey(token, apiKey) {
  const res = await fetch(`${API_BASE_URL}/users/me/api-key`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ api_key: apiKey }),
  });
  if (!res.ok) throw new Error('Failed to save API key');
  return res.json();
}
