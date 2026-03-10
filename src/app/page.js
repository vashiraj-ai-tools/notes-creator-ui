'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MarkdownOutput from '@/components/MarkdownOutput';
import UploadInput from '@/components/UploadInput';
import {
  submitJob,
  submitGuestJob,
  submitUploadJob,
  submitGuestUploadJob,
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

  // ── Input mode ──
  const [inputMode, setInputMode] = useState('url'); // 'url' | 'upload'

  // ── URL mode state ──
  const [url, setUrl] = useState('');

  // ── Shared job state ──
  const [phase, setPhase] = useState('idle'); // idle | submitting | polling | done | error
  const [jobStatus, setJobStatus] = useState(null);
  const [notes, setNotes] = useState(null);
  const [source, setSource] = useState(null);
  const [error, setError] = useState(null);
  const [guestUsage, setGuestUsage] = useState({ used: 0, remaining: GUEST_LIMIT });

  const isLoading = phase === 'submitting' || phase === 'polling';

  useEffect(() => {
    if (!user) setGuestUsage(getGuestUsage());
  }, [user]);

  const isFreeTier = user && (!hasApiKey || !useOwnKey);

  // ── Shared polling helper ──
  const pollAndFetch = useCallback(async (job, isGuest) => {
    setPhase('polling');
    setJobStatus(job.status);

    if (isGuest) {
      await pollGuestJobStatus(job.job_id, (s) => setJobStatus(s.status));
      const result = await fetchGuestJobResult(job.job_id);
      setNotes(result.notes);
      setSource(result.source);
    } else {
      await pollJobStatus(job.job_id, (s) => setJobStatus(s.status), idToken);
      const result = await fetchJobResult(job.job_id, idToken);
      setNotes(result.notes);
      setSource(result.source);
    }
    setPhase('done');
  }, [idToken]);

  // ── URL submit handler ──
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
        const usage = getGuestUsage();
        if (usage.remaining <= 0) {
          setError("You've used all 2 free guest requests. Log in for 5 free requests, or add your API key for unlimited access.");
          setPhase('error');
          return;
        }
        const job = await submitGuestJob(url);
        recordGuestUsage();
        setGuestUsage(getGuestUsage());
        await pollAndFetch(job, true);
      } else {
        const job = await submitJob(url, idToken);
        await pollAndFetch(job, false);
        if (isFreeTier) await refreshProfile(idToken);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
      setPhase('error');
      if (user && idToken) await refreshProfile(idToken);
    }
  }, [url, isLoading, user, idToken, isFreeTier, refreshProfile, pollAndFetch]);

  // ── Upload submit handler ──
  const handleUpload = useCallback(async ({ uploadType, textContent, file }) => {
    if (isLoading) return;

    setPhase('submitting');
    setJobStatus(null);
    setError(null);
    setNotes(null);
    setSource(null);

    try {
      if (!user) {
        const usage = getGuestUsage();
        if (usage.remaining <= 0) {
          setError("You've used all 2 free guest requests. Log in for 5 free requests, or add your API key for unlimited access.");
          setPhase('error');
          return;
        }
        const job = await submitGuestUploadJob({ uploadType, textContent, file });
        recordGuestUsage();
        setGuestUsage(getGuestUsage());
        await pollAndFetch(job, true);
      } else {
        const job = await submitUploadJob({ uploadType, textContent, file }, idToken);
        await pollAndFetch(job, false);
        if (isFreeTier) await refreshProfile(idToken);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
      setPhase('error');
      if (user && idToken) await refreshProfile(idToken);
    }
  }, [isLoading, user, idToken, isFreeTier, refreshProfile, pollAndFetch]);

  const sourceIcon = source?.type === 'youtube' ? (
    <svg className="text-red-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <polygon points="10 15 15 12 10 9 10 15" fill="var(--background)" />
    </svg>
  ) : source?.type === 'audio' ? (
    <svg className="text-emerald-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </svg>
  ) : source?.type === 'video' ? (
    <svg className="text-purple-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" />
    </svg>
  ) : source?.type === 'document' ? (
    <svg className="text-amber-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
  ) : (
    <svg className="text-blue-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );

  const sourceLabel = source?.type === 'youtube' ? 'Video'
    : source?.type === 'audio' ? 'Audio'
      : source?.type === 'video' ? 'Uploaded Video'
        : source?.type === 'document' ? 'Document'
          : 'Article';

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center py-24 px-4 sm:px-6 lg:px-8 bg-background">
      {/* Background Decorators */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header Info */}
      <div className="text-center max-w-4xl mb-12 animate-in fade-in slide-in-from-top-8 duration-1000 mt-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          Turn any <span className="text-primary font-black">Video, Audio, or Article</span> into structured notes.
        </h1>
        <p className="text-base sm:text-lg text-foreground/60 mb-10 max-w-2xl mx-auto">
          Paste a link, upload a file, or drop in your own text — get clean, concise revision notes in seconds.
        </p>

        {/* Input Mode Switcher */}
        <div className="flex gap-1 p-1 rounded-xl bg-surface border border-border max-w-[280px] sm:max-w-xs mx-auto mb-8">
          <button
            id="mode-url-btn"
            type="button"
            onClick={() => { setInputMode('url'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${inputMode === 'url'
                ? 'bg-primary text-white shadow-sm'
                : 'text-foreground/60 hover:text-foreground hover:bg-white/5'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            URL
          </button>
          <button
            id="mode-upload-btn"
            type="button"
            onClick={() => { setInputMode('upload'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${inputMode === 'upload'
                ? 'bg-primary text-white shadow-sm'
                : 'text-foreground/60 hover:text-foreground hover:bg-white/5'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload
          </button>
        </div>

        {/* URL Input */}
        {inputMode === 'url' && (
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
                placeholder="Paste any link — YouTube, blog, podcast, audio/video file…"
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
                    <line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </>
              )}
            </button>
          </form>
        )}

        {/* Upload Input */}
        {inputMode === 'upload' && (
          <UploadInput onSubmit={handleUpload} isLoading={isLoading} />
        )}

        {/* Job loading state */}
        {isLoading && jobStatus && (
          <DynamicLoader
            jobStatus={jobStatus}
            sourceType={
              inputMode === 'upload' ? 'document'
                : (url.toLowerCase().includes('youtube.com') || url.toLowerCase().includes('youtu.be')) ? 'youtube'
                  : /\.(mp3|wav|m4a|ogg|flac|aac|opus|wma)([?#]|$)/i.test(url) ? 'audio'
                    : /\.(mp4|mkv|avi|mov|webm|wmv|flv|ts)([?#]|$)/i.test(url) ? 'video'
                      : 'blog'
            }
          />
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm max-w-3xl mx-auto flex gap-3 animate-in slide-in-from-top-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span className="text-left">{error}</span>
          </div>
        )}
      </div>

      {/* Results */}
      {notes && (
        <div className="w-full max-w-5xl flex flex-col items-center">
          <div className="inline-flex items-center gap-2 mb-2 px-4 py-1.5 bg-surface rounded-full border border-border text-sm text-foreground/80">
            {sourceIcon}
            {source?.title && <span className="max-w-xs truncate">{source.title}</span>}
            <span>·</span>
            <span>Notes from {sourceLabel}</span>
          </div>
          <MarkdownOutput content={notes} />
        </div>
      )}

      <ApiKeyModal isOpen={showApiKeyModal} onClose={() => setShowApiKeyModal(false)} />
      {!user && <QuotaPopup />}
    </main>
  );
}
