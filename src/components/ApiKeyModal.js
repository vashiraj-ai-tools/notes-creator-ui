'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { saveApiKey } from '@/lib/api';

export default function ApiKeyModal({ isOpen, onClose }) {
  const { idToken, hasApiKey, refreshProfile } = useAuth();
  const [apiKey, setApiKeyValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!idToken) throw new Error("Not authenticated");
      await saveApiKey(idToken, apiKey);
      await refreshProfile();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save API key");
    } finally {
      setLoading(false);
      setApiKeyValue('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-surface border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-foreground/50 hover:text-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <h2 className="text-2xl font-bold mb-2 text-foreground">Gemini API Key</h2>
        <p className="text-foreground/70 text-sm mb-6">
          {hasApiKey
            ? "You already have a secure API key saved. Enter a new one below to overwrite it."
            : "To generate notes, please provide your Gemini API key. It will be encrypted and stored securely."}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              type="password"
              placeholder="AIzaSy..."
              required
              className="glass-input w-full p-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={apiKey}
              onChange={(e) => setApiKeyValue(e.target.value)}
              disabled={loading}
            />
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading || !apiKey}
            className="primary-button w-full py-3 rounded-xl font-medium flex justify-center items-center disabled:opacity-70"
          >
            {loading ? "Saving..." : "Save API Key"}
          </button>
        </form>
        <p className="text-xs text-foreground/50 mt-4 text-center">
          Get your free API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google AI Studio</a>.
        </p>
      </div>
    </div>
  );
}
