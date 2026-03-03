'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MarkdownOutput from '@/components/MarkdownOutput';
import {
  submitJob,
  submitGuestJob,
  pollJobStatus,
  pollGuestJobStatus,
  fetchJobResult,
  fetchGuestJobResult,
} from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import ApiKeyModal from '@/components/ApiKeyModal';
import DynamicLoader from '@/components/DynamicLoader';
import QuotaPopup from '@/components/QuotaPopup';

const GUEST_STORAGE_KEY = 'guestRequests';
const GUEST_LIMIT = 2;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

function getGuestUsage() {
  try {
    const stored = JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY) || '[]');
    const cutoff = Date.now() - WINDOW_MS;
    const recent = stored.filter(ts => ts > cutoff);
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(recent));
    return { used: recent.length, remaining: Math.max(0, GUEST_LIMIT - recent.length) };
  } catch {
    return { used: 0, remaining: GUEST_LIMIT };
  }
}

function recordGuestUsage() {
  try {
    const stored = JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY) || '[]');
    stored.push(Date.now());
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(stored));
  } catch { /* ignore */ }
}

export default function Home() {
  const router = useRouter();
  const { user, idToken, hasApiKey, useOwnKey, rateLimit, refreshProfile } = useAuth();
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const [url, setUrl] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | submitting | polling | done | error
  const [jobStatus, setJobStatus] = useState(null);
  const [notes, setNotes] = useState(null);
  const [source, setSource] = useState(null);
  const [error, setError] = useState(null);
  const [guestUsage, setGuestUsage] = useState({ used: 0, remaining: GUEST_LIMIT });

  const isLoading = phase === 'submitting' || phase === 'polling';

  // Calculate guest usage on mount
  useEffect(() => {
    if (!user) {
      setGuestUsage(getGuestUsage());
    }
  }, [user]);

  const isFreeTier = user && (!hasApiKey || !useOwnKey);

  const handleGenerate = useCallback(async (e) => {
    e.preventDefault();
    if (!url || isLoading) return;

    setPhase('submitting');
    setJobStatus(null);
    setError(null);
    setNotes(null);
    setSource(null);

    try {
      if (!user) {
        // ── Guest flow ──
        const usage = getGuestUsage();
        if (usage.remaining <= 0) {
          setError("You've used all 2 free guest requests. Log in for 5 free requests, or add your API key for unlimited access.");
          setPhase('error');
          return;
        }

        const job = await submitGuestJob(url);
        recordGuestUsage();
        setGuestUsage(getGuestUsage());
        setPhase('polling');
        setJobStatus(job.status);

        await pollGuestJobStatus(job.job_id, (status) => setJobStatus(status.status));
        const result = await fetchGuestJobResult(job.job_id);
        setNotes(result.notes);
        setSource(result.source);
        setPhase('done');
      } else {
        // ── Authenticated flow ──
        const job = await submitJob(url, idToken);
        setPhase('polling');
        setJobStatus(job.status);

        await pollJobStatus(job.job_id, (status) => setJobStatus(status.status), idToken);
        const result = await fetchJobResult(job.job_id, idToken);
        setNotes(result.notes);
        setSource(result.source);
        setPhase('done');

        if (isFreeTier) {
          await refreshProfile(idToken);
        }
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
      setPhase('error');
      if (user && idToken) {
        await refreshProfile(idToken);
      }
    }
  }, [url, isLoading, user, idToken, isFreeTier, refreshProfile]);

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center py-20 px-4 sm:px-6 lg:px-8">
      {/* Background Decorators */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[40%] right-[-10%] w-[30%] h-[30%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none -z-10" />

      {/* Header Info */}
      <div className="text-center max-w-4xl mb-12 animate-in fade-in slide-in-from-top-8 duration-1000">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
          Turn any <span className="text-gradient">Video or Blog</span> into structured notes.
        </h1>
        <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
          Paste a YouTube link or an article URL below to instantly generate comprehensive, clean, and easy-to-read revision notes.
        </p>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-4 w-full max-w-3xl mx-auto">
          <div className="relative flex-grow group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              id="url-input"
              type="url"
              required
              placeholder="Paste YT video or blog link here."
              className="glass-input block w-full pl-11 pr-4 py-4 rounded-xl text-foreground placeholder-foreground/40 sm:text-lg focus:outline-none"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <button
            id="generate-btn"
            type="submit"
            disabled={isLoading || !url}
            className="primary-button py-4 px-8 rounded-xl text-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {phase === 'submitting' ? 'Submitting…' : 'Processing…'}
              </>
            ) : (
              <>
                Generate Notes
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Job loading state */}
        {isLoading && jobStatus && (
          <DynamicLoader
            jobStatus={jobStatus}
            sourceType={url.toLowerCase().includes('youtube.com') || url.toLowerCase().includes('youtu.be') ? 'youtube' : 'blog'}
          />
        )}
        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm max-w-3xl mx-auto flex gap-3 animate-in slide-in-from-top-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span className="text-left">{error}</span>
          </div>
        )}
      </div>

      {/* Results */}
      {notes && (
        <div className="w-full max-w-5xl flex flex-col items-center">
          <div className="inline-flex items-center gap-2 mb-2 px-4 py-1.5 bg-surface rounded-full border border-border text-sm text-foreground/80">
            {source?.type === 'youtube' ? (
              <svg className="text-red-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><polygon points="10 15 15 12 10 9 10 15" fill="var(--background)" /></svg>
            ) : (
              <svg className="text-blue-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
            )}
            {source?.title && <span className="max-w-xs truncate">{source.title}</span>}
            <span>·</span>
            <span>Notes from {source?.type === 'youtube' ? 'Video' : 'Article'}</span>
          </div>
          <MarkdownOutput content={notes} />
        </div>
      )}

      <ApiKeyModal isOpen={showApiKeyModal} onClose={() => setShowApiKeyModal(false)} />
      {!user && <QuotaPopup />}
    </main>
  );
}
