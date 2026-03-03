'use client';

import Link from 'next/link';

export default function DocsPage() {
  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center py-24 px-4 sm:px-6 lg:px-8">
      {/* Background Decorators */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none -z-10" />

      <div className="w-full max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            How to use <span className="text-gradient">Notes Creator</span>
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Everything you need to know about generating notes, managing quotas, and setting up your API key.
          </p>
        </section>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Quick Start */}
          <div className="glass-card p-8 rounded-2xl border border-border space-y-4">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </div>
            <h2 className="text-2xl font-bold">Quick Start</h2>
            <ol className="space-y-3 text-foreground/70">
              <li className="flex gap-3">
                <span className="font-bold text-primary">1.</span>
                <span>Copy a YouTube video URL or a blog post link.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">2.</span>
                <span>Paste it into the input field on the home page.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">3.</span>
                <span>Click "Generate Notes" and wait for the AI to process.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">4.</span>
                <span>Read, copy, or save your structured revision notes.</span>
              </li>
            </ol>
          </div>

          {/* Usage Quotas */}
          <div className="glass-card p-8 rounded-2xl border border-border space-y-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            </div>
            <h2 className="text-2xl font-bold">Usage Quotas</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-xl bg-background/50 border border-border">
                <span className="font-medium">Guest</span>
                <span className="text-sm px-2 py-1 bg-surface rounded-lg text-foreground/60">2 per 24 hours</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-background/50 border border-border">
                <span className="font-medium">Logged-in User</span>
                <span className="text-sm px-2 py-1 bg-surface rounded-lg text-foreground/60">5 per 24 hours</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <span className="font-medium text-green-400">With API Key</span>
                <span className="text-sm font-bold text-green-400">Unlimited</span>
              </div>
            </div>
          </div>
        </div>

        {/* API Key Guide */}
        <section className="glass-card p-8 md:p-12 rounded-3xl border border-border space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Gemini API Key Guide</h2>
            <p className="text-foreground/70">
              By adding your own Gemini API key, you can bypass our shared limits and enjoy unlimited note generation.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                How to find your key
              </h3>
              <ul className="space-y-3 text-foreground/70 list-disc pl-5">
                <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google AI Studio</a>.</li>
                <li>Sign in with your Google account.</li>
                <li>Click <strong>"Create API key in new project"</strong>.</li>
                <li>Copy the generated key (starts with <code>AIzaSy...</code>).</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>
                Manage your key
              </h3>
              <ul className="space-y-3 text-foreground/70">
                <li className="flex gap-2 items-start">
                  <span className="font-bold text-foreground">Add:</span>
                  <span>Click your quota badge in the header, paste your key, and click "Save".</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="font-bold text-foreground">Enable/Disable:</span>
                  <span>Use the toggle in the API Key settings to switch between your key and the free tier.</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="font-bold text-foreground">Delete:</span>
                  <span>Click "Delete" in the API Key settings to remove your key from our servers.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="text-center">
          <Link href="/" className="primary-button px-8 py-4 rounded-xl font-bold inline-flex items-center gap-2">
            Back to Home
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </Link>
        </section>
      </div>
    </main>
  );
}
