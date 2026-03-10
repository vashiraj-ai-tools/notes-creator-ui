'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { auth } from '@/lib/firebase';
import ApiKeyModal from './ApiKeyModal';

const GUEST_STORAGE_KEY = 'guestRequests';
const GUEST_LIMIT = 2;
const WINDOW_MS = 24 * 60 * 60 * 1000;

function getGuestUsage() {
  try {
    const stored = JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY) || '[]');
    const cutoff = Date.now() - WINDOW_MS;
    const recent = stored.filter(ts => ts > cutoff);
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(recent));
    return { remaining: Math.max(0, GUEST_LIMIT - recent.length), limit: GUEST_LIMIT };
  } catch {
    return { remaining: GUEST_LIMIT, limit: GUEST_LIMIT };
  }
}

export default function Header() {
  const { user, hasApiKey, useOwnKey, rateLimit } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [guestUsage, setGuestUsage] = useState({ remaining: GUEST_LIMIT, limit: GUEST_LIMIT });

  useEffect(() => {
    if (!user) {
      setGuestUsage(getGuestUsage());
    }
  }, [user]);

  const handleLogout = () => auth.signOut();

  const isUnlimited = user && hasApiKey && useOwnKey;
  const remaining = user ? (rateLimit?.remaining ?? 0) : guestUsage.remaining;
  const limit = user ? (rateLimit?.limit ?? 5) : guestUsage.limit;

  return (
    <>
      <header className="w-full fixed top-0 backdrop-blur-md bg-background/80 border-b border-border z-40 px-6 py-4 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-primary/10 p-1.5 rounded-lg group-hover:bg-primary/20 transition-colors border border-primary/20">
              <img
                src="/icon.png"
                alt="Notes Creator Logo"
                className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg sm:text-xl tracking-tight text-foreground/90 group-hover:text-foreground transition-colors leading-none">Notes Creator</span>
              <span className="hidden sm:block text-[10px] text-foreground/50 font-medium tracking-wide mt-1">by raj vashisht</span>
            </div>
          </Link>

          <Link href="/docs" className="text-sm font-medium text-foreground/60 hover:text-primary transition-colors hidden md:block">
            Docs
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Rate limit / key status badge – always visible */}
          <button
            onClick={() => user ? setShowModal(true) : null}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-300 ${isUnlimited
              ? 'bg-green-500/15 text-green-400 border border-green-500/20 hover:bg-green-500/25 hover:scale-105 cursor-pointer'
              : 'bg-blue-500/15 text-blue-400 border border-blue-500/20' + (user ? ' hover:bg-blue-500/25 hover:scale-105 cursor-pointer' : '')
              }`}
          >
            {isUnlimited ? (
              <span className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>
                Unlimited
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                {remaining}/{limit} left
              </span>
            )}
          </button>

          {user ? (
            <>
              <span className="text-sm text-foreground/60 hidden sm:inline-block">{user.email}</span>
              <button onClick={handleLogout} className="text-sm px-4 py-2 rounded-lg bg-surface border border-border hover:bg-border transition-colors">Logout</button>
            </>
          ) : (
            <Link href="/login" className="primary-button text-sm px-5 py-2 rounded-lg shadow-lg hover:shadow-primary/20 transition-all font-medium">Log In</Link>
          )}
        </div>
      </header>
      <ApiKeyModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
