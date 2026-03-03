/**
 * Centralised API client for the Notes Creator backend.
 * Change API_BASE_URL here if the server port or host changes.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes max

// ── Helper ─────────────────────────────────────────────────────────────────

function authHeaders(token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function parseError(res, fallback) {
  const data = await res.json().catch(() => ({}));
  if (data.detail) {
    if (typeof data.detail === 'string') return data.detail;
    if (typeof data.detail === 'object' && data.detail.message) return data.detail.message;
    if (Array.isArray(data.detail)) return data.detail.map(d => d.msg).join(', ');
  }
  return fallback;
}

// ── Job submission ─────────────────────────────────────────────────────────

/** Submit a new notes-generation job (authenticated). Returns { job_id, status }. */
export async function submitJob(url, token) {
  const res = await fetch(`${API_BASE_URL}/api/jobs/`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error(await parseError(res, 'Failed to submit job'));
  return res.json();
}

/** Submit a guest job (no auth, IP rate-limited). Returns { job_id, status }. */
export async function submitGuestJob(url) {
  const res = await fetch(`${API_BASE_URL}/api/jobs/guest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error(await parseError(res, 'Failed to submit job'));
  return res.json();
}

// ── Job polling ────────────────────────────────────────────────────────────

/** Poll job status until completed or failed. */
export async function pollJobStatus(jobId, onStatusUpdate, token) {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  while (Date.now() < deadline) {
    const res = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to fetch job status');

    onStatusUpdate?.(data);
    if (data.status === 'completed') return data;
    if (data.status === 'failed') throw new Error(data.error || 'Job failed with no details');

    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
  }
  throw new Error('Job timed out. Please try again.');
}

/** Poll guest job status. */
export async function pollGuestJobStatus(jobId, onStatusUpdate) {
  const deadline = Date.now() + POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const res = await fetch(`${API_BASE_URL}/api/jobs/guest/${jobId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to fetch job status');

    onStatusUpdate?.(data);
    if (data.status === 'completed') return data;
    if (data.status === 'failed') throw new Error(data.error || 'Job failed with no details');

    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
  }
  throw new Error('Job timed out. Please try again.');
}

// ── Job results ────────────────────────────────────────────────────────────

/** Fetch the final notes result for a completed job. */
export async function fetchJobResult(jobId, token) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/result`, { headers });
  if (!res.ok) throw new Error(await parseError(res, 'Failed to fetch notes'));
  return res.json();
}

/** Fetch guest job result. */
export async function fetchGuestJobResult(jobId) {
  const res = await fetch(`${API_BASE_URL}/api/jobs/guest/${jobId}/result`);
  if (!res.ok) throw new Error(await parseError(res, 'Failed to fetch notes'));
  return res.json();
}

// ── User profile ───────────────────────────────────────────────────────────

/** Fetch user profile (includes rate_limit, has_api_key, use_own_key). */
export async function getUserProfile(token) {
  if (!token) return null;
  const res = await fetch(`${API_BASE_URL}/users/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

/** Save / update Gemini API Key. */
export async function saveApiKey(token, apiKey) {
  const res = await fetch(`${API_BASE_URL}/users/me/api-key`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ api_key: apiKey }),
  });
  if (!res.ok) throw new Error(await parseError(res, 'Failed to save API key'));
  return res.json();
}

/** Delete the user's saved API key. */
export async function deleteApiKey(token) {
  const res = await fetch(`${API_BASE_URL}/users/me/api-key`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res, 'Failed to delete API key'));
  return res.json();
}

/** Toggle between own API key and free tier. */
export async function toggleApiKey(token, useOwnKey) {
  const res = await fetch(`${API_BASE_URL}/users/me/api-key-toggle`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ use_own_key: useOwnKey }),
  });
  if (!res.ok) throw new Error(await parseError(res, 'Failed to toggle API key'));
  return res.json();
}
