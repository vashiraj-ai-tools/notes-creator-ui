'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function QuotaPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the popup in this session
    const hasSeenPopup = sessionStorage.getItem('hasSeenQuotaPopup');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500); // Show after 1.5 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('hasSeenQuotaPopup', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right-8 duration-500">
      <div className="bg-surface border border-border p-6 rounded-2xl shadow-2xl max-w-sm relative overflow-hidden group">
        {/* Progress bar at bottom */}
        <div className="absolute bottom-0 left-0 h-1 bg-primary/30 w-full">
          <div className="h-full bg-primary animate-progress-shrink" style={{ animationDuration: '0s' }} />
        </div>

        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-foreground/40 hover:text-foreground transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="flex gap-4">
          <div className="bg-primary/20 p-3 rounded-xl shrink-0 h-fit">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-lg leading-tight">Welcome to Notes Creator!</h3>
            <p className="text-sm text-foreground/70 leading-relaxed">
              As a guest, you have <span className="font-bold text-foreground">2 free requests</span> every 24 hours.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/docs"
                onClick={handleClose}
                className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Learn about quotas & limits
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </Link>
              <Link
                href="/login"
                onClick={handleClose}
                className="text-xs text-foreground/50 hover:text-foreground transition-colors"
              >
                Log in for more or add your own key
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
