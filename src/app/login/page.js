'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    try {
      setIsProcessing(true);
      setError('');
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google');
      setIsProcessing(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      setError('');
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        // Note: You can optionally set displayName or call a backend endpoint
        // here if you want to initialize the user's backend profile explicitly.
        // Currently, our backend get_or_create_user handles this via token verify.
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
      setIsProcessing(false);
    }
  };

  if (loading || user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Visual Decorators */}
      <div className="absolute top-1/4 left-1/4 w-[30%] h-[30%] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[30%] h-[30%] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none -z-10" />

      <div className="w-full max-w-md bg-surface border border-border rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground tracking-tight">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-foreground/60 text-sm">
            Sign in to securely store your API keys and notes
          </p>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-3 bg-white text-black py-3 px-4 rounded-xl font-medium hover:bg-gray-100 transition-colors disabled:opacity-70 border border-gray-200"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-border"></div>
          <span className="text-xs text-foreground/40 uppercase tracking-widest font-medium">or email</span>
          <div className="flex-1 h-px bg-border"></div>
        </div>

        <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Email address</label>
            <input
              type="email"
              required
              className="glass-input w-full p-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isProcessing}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Password</label>
            <input
              type="password"
              required
              disabled={isProcessing}
              className="glass-input w-full p-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}

          <button
            type="submit"
            disabled={isProcessing || !email || !password}
            className="primary-button w-full py-3.5 mt-2 rounded-xl font-medium disabled:opacity-70 transition-all flex justify-center items-center"
          >
            {isProcessing ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              isLogin ? 'Sign In' : 'Sign Up'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-foreground/60 mt-8">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">
            {isLogin ? 'Create one' : 'Sign in instead'}
          </button>
        </p>
      </div>
    </div>
  );
}
