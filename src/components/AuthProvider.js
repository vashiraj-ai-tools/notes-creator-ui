'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile } from '@/lib/api';

const AuthContext = createContext({
  user: null,
  loading: true,
  idToken: null,
  hasApiKey: false,
  refreshProfile: async () => { },
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState(null);
  const [hasApiKey, setHasApiKey] = useState(false);

  const refreshProfile = async (token) => {
    try {
      const currentToken = token || idToken;
      if (!currentToken) return;
      const profile = await getUserProfile(currentToken);
      setHasApiKey(profile?.has_api_key || false);
    } catch (err) {
      console.error("Failed to fetch user profile", err);
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
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, idToken, hasApiKey, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
