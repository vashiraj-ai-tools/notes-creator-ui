'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { auth } from '@/lib/firebase';
import ApiKeyModal from './ApiKeyModal';

export default function Header() {
  const { user, loading } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => auth.signOut();

  return (
    <>
      <header className="w-full fixed top-0 backdrop-blur-md bg-background/80 border-b border-border z-40 px-6 py-4 flex justify-between items-center transition-all duration-300">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary/20 p-2 rounded-lg group-hover:bg-primary/30 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground/90 group-hover:text-foreground transition-colors">Notes Creator</span>
        </Link>
        <div className="flex items-center gap-4">
          {!loading && (
            user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-foreground/60 hidden sm:inline-block">{user.email}</span>
                <button onClick={() => setShowModal(true)} className="text-sm text-foreground/80 hover:text-primary transition-colors flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                  API Key
                </button>
                <button onClick={handleLogout} className="text-sm px-4 py-2 rounded-lg bg-surface border border-border hover:bg-border transition-colors">Logout</button>
              </div>
            ) : (
              <Link href="/login" className="primary-button text-sm px-5 py-2 rounded-lg shadow-lg hover:shadow-primary/20 transition-all font-medium">Log In</Link>
            )
          )}
        </div>
      </header>
      <ApiKeyModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
