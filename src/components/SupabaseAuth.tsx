import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const SupabaseAuth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setMessage('Sign up successful! Please check your email to confirm your account.');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setMessage('Sign in successful!');
    }
  };

  const handleSignOut = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setMessage('Signed out successfully.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setMessage('Password reset email sent! Please check your inbox.');
      setShowReset(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    setLoading(false);
    if (error) {
      setError(error.message);
    }
  };

  if (user) {
    return (
      <div style={{ maxWidth: 400, margin: '0 auto', padding: 24 }}>
        <h2>Welcome, {user.email}</h2>
        <button onClick={handleSignOut} disabled={loading} style={{ marginBottom: 8 }}>
          Sign Out
        </button>
        <div style={{ fontSize: 12, color: '#555' }}>
          <strong>User ID:</strong> {user.id}
        </div>
        {message && <div style={{ color: 'green', marginTop: 8 }}>{message}</div>}
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 24 }}>
      <h2>Sign Up / Sign In</h2>
      <form>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 8 }}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 8 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button onClick={handleSignUp} type="submit" disabled={loading}>Sign Up</button>
          <button onClick={handleSignIn} type="button" disabled={loading}>Sign In</button>
        </div>
        <button type="button" onClick={() => setShowReset(!showReset)} style={{ marginBottom: 8 }}>
          Forgot Password?
        </button>
        <button type="button" onClick={handleGoogleSignIn} style={{ background: '#4285F4', color: 'white', width: '100%' }} disabled={loading}>
          Sign in with Google
        </button>
        {showReset && (
          <form onSubmit={handleResetPassword} style={{ marginTop: 8 }}>
            <input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              required
              style={{ width: '100%', marginBottom: 8 }}
            />
            <button type="submit" disabled={loading}>Send Reset Email</button>
          </form>
        )}
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        {message && <div style={{ color: 'green', marginTop: 8 }}>{message}</div>}
      </form>
    </div>
  );
};

export default SupabaseAuth; 