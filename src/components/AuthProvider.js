'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile, toggleApiKey as apiToggleKey } from '@/lib/api';

const AuthContext = createContext({
  user: null,
  ready: false,
  idToken: null,
  hasApiKey: false,
  useOwnKey: true,
  rateLimit: null,
  refreshProfile: async () => { },
  toggleApiKey: async () => { },
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [idToken, setIdToken] = useState(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [useOwnKey, setUseOwnKey] = useState(true);
  const [rateLimit, setRateLimit] = useState(null);

  const refreshProfile = async (token) => {
    try {
      const currentToken = token || idToken;
      if (!currentToken) return;
      const profile = await getUserProfile(currentToken);
      setHasApiKey(profile?.has_api_key || false);
      setUseOwnKey(profile?.use_own_key ?? true);
      setRateLimit(profile?.rate_limit || null);
    } catch (err) {
      console.error("Failed to fetch user profile", err);
    }
  };

  const toggleApiKey = async (useOwn) => {
    try {
      if (!idToken) return;
      await apiToggleKey(idToken, useOwn);
      setUseOwnKey(useOwn);
      await refreshProfile(idToken);
    } catch (err) {
      console.error("Failed to toggle API key", err);
      throw err;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const token = await currentUser.getIdToken();
        setIdToken(token);
        await refreshProfile(token);
      } else {
        setIdToken(null);
        setHasApiKey(false);
        setUseOwnKey(true);
        setRateLimit(null);
      }
      setReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Full-screen loading gate – prevents any UI flicker
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="bg-primary/20 p-4 rounded-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className="text-foreground/50 text-sm font-medium">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, ready, idToken, hasApiKey, useOwnKey, rateLimit, refreshProfile, toggleApiKey }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
