'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MarkdownOutput from '@/components/MarkdownOutput';
import { submitJob, pollJobStatus, fetchJobResult } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import ApiKeyModal from '@/components/ApiKeyModal';
import DynamicLoader from '@/components/DynamicLoader';
const STATUS_LABELS = {
  pending: 'Queued for processing…',
  running: 'Generating your notes…',
  completed: 'Done!',
  failed: 'Failed',
};

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading, idToken, hasApiKey } = useAuth();
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const [url, setUrl] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | submitting | polling | done | error
  const [jobStatus, setJobStatus] = useState(null); // 'pending' | 'running' | 'completed'
  const [notes, setNotes] = useState(null);
  const [source, setSource] = useState(null);
  const [error, setError] = useState(null);

  const isLoading = phase === 'submitting' || phase === 'polling' || authLoading;

  const handleGenerate = useCallback(async (e) => {
    e.preventDefault();
    if (!url || isLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (!hasApiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setPhase('submitting');
    setJobStatus(null);
    setError(null);
    setNotes(null);
    setSource(null);

    try {
      // 1. Create the job
      const job = await submitJob(url, idToken);
      setPhase('polling');
      setJobStatus(job.status);

      // 2. Poll until done
      await pollJobStatus(job.job_id, (status) => setJobStatus(status.status), idToken);

      // 3. Fetch the result
      const result = await fetchJobResult(job.job_id, idToken);
      setNotes(result.notes);
      setSource(result.source);
      setPhase('done');
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
      setPhase('error');
    }
  }, [url, isLoading, user, hasApiKey, idToken, router]);

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center py-20 px-4 sm:px-6 lg:px-8">
      {/* Background Decorators */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[40%] right-[-10%] w-[30%] h-[30%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none -z-10" />

      {/* Header Info */}
      <div className="text-center max-w-3xl mb-12 animate-in fade-in slide-in-from-top-8 duration-1000">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
          Turn any <span className="text-gradient">Video or Blog</span> into structured notes.
        </h1>
        <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
          Paste a YouTube link or an article URL below to instantly generate comprehensive, clean, and easy-to-read revision notes.
        </p>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl mx-auto">
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
              placeholder="https://youtube.com/watch?v=... or https://medium.com/..."
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
                {authLoading ? 'Loading…' : phase === 'submitting' ? 'Submitting…' : 'Processing…'}
              </>
            ) : (
              <>
                {user ? 'Generate Notes' : 'Log in to Generate'}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {user ? (
                    <>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </>
                  ) : (
                    <>
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                      <polyline points="10 17 15 12 10 7"></polyline>
                      <line x1="15" y1="12" x2="3" y2="12"></line>
                    </>
                  )}
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Job loading state */}
        {isLoading && jobStatus && (
          <DynamicLoader jobStatus={jobStatus} />
        )}
        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm max-w-2xl mx-auto flex gap-3 animate-in slide-in-from-top-2">
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
        <div className="w-full flex flex-col items-center">
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
    </main>
  );
}
