'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { saveApiKey, deleteApiKey } from '@/lib/api';

export default function ApiKeyModal({ isOpen, onClose }) {
  const { idToken, hasApiKey, useOwnKey, rateLimit, refreshProfile, toggleApiKey } = useAuth();
  const [apiKey, setApiKeyValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (!idToken) throw new Error("Not authenticated");
      await saveApiKey(idToken, apiKey);
      await refreshProfile();
      setSuccessMsg('API key saved successfully!');
      setApiKeyValue('');
    } catch (err) {
      setError(err.message || "Failed to save API key");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      if (!idToken) throw new Error("Not authenticated");
      await deleteApiKey(idToken);
      await refreshProfile();
      setSuccessMsg('API key deleted.');
    } catch (err) {
      setError(err.message || "Failed to delete API key");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    setError('');
    setSuccessMsg('');
    try {
      await toggleApiKey(!useOwnKey);
      setSuccessMsg(useOwnKey ? 'Switched to free tier.' : 'Using your own API key.');
    } catch (err) {
      setError(err.message || "Failed to toggle");
    }
  };

  const remaining = rateLimit?.remaining ?? 0;
  const limit = rateLimit?.limit ?? 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-surface border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-foreground/50 hover:text-foreground transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <h2 className="text-2xl font-bold mb-4 text-foreground">API Key Settings</h2>

        {/* Current status */}
        <div className="mb-4 p-3 rounded-xl bg-background/50 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-foreground/70">Status</span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${hasApiKey && useOwnKey
                ? 'bg-green-500/20 text-green-400'
                : 'bg-blue-500/20 text-blue-400'
              }`}>
              {hasApiKey && useOwnKey ? '🔑 Own Key (Unlimited)' : `⚡ Free Tier (${remaining}/${limit})`}
            </span>
          </div>

          {/* Toggle – only show if user has an API key */}
          {hasApiKey && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className="text-sm text-foreground/80">Use my API key</span>
              <button
                onClick={handleToggle}
                disabled={loading}
                className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${useOwnKey ? 'bg-primary' : 'bg-border'
                  }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${useOwnKey ? 'translate-x-5' : 'translate-x-0'
                  }`} />
              </button>
            </div>
          )}

          {/* Rate limit info when not using own key */}
          {(!hasApiKey || !useOwnKey) && rateLimit && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between text-xs text-foreground/60">
                <span>Free requests remaining</span>
                <span className="font-mono">{remaining}/{limit}</span>
              </div>
              <div className="w-full bg-border rounded-full h-1.5 mt-2">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(0, (remaining / limit) * 100)}%` }}
                />
              </div>
              {rateLimit.resets_at && remaining === 0 && (
                <p className="text-xs text-foreground/50 mt-2">
                  Resets at {new Date(rateLimit.resets_at).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Add/update key form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <p className="text-foreground/70 text-sm">
            {hasApiKey
              ? "Enter a new key to overwrite your saved one."
              : "Add your Gemini API key for unlimited usage."}
          </p>
          <input
            type="password"
            placeholder="AIzaSy..."
            required
            className="glass-input w-full p-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={apiKey}
            onChange={(e) => setApiKeyValue(e.target.value)}
            disabled={loading}
          />

          {error && <p className="text-red-400 text-xs">{error}</p>}
          {successMsg && <p className="text-green-400 text-xs">{successMsg}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !apiKey}
              className="primary-button flex-1 py-3 rounded-xl font-medium flex justify-center items-center disabled:opacity-70"
            >
              {loading ? "Saving..." : hasApiKey ? "Update Key" : "Save API Key"}
            </button>

            {hasApiKey && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-3 rounded-xl font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-70"
              >
                Delete
              </button>
            )}
          </div>
        </form>

        <p className="text-xs text-foreground/50 mt-4 text-center">
          Get your free API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google AI Studio</a>.
        </p>
      </div>
    </div>
  );
}
