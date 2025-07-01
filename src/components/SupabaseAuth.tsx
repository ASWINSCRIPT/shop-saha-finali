import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/utils';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { FaGoogle, FaGithub } from 'react-icons/fa';

interface AuthFormInputs {
  email: string;
  password: string;
}

const SupabaseAuth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showReset, setShowReset] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const form = useForm<AuthFormInputs>({
    defaultValues: { email: '', password: '' },
  });
  const resetForm = useForm<{ email: string }>({
    defaultValues: { email: '' },
  });

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => { listener.subscription.unsubscribe(); };
  }, []);

  const onSubmit = async (data: AuthFormInputs) => {
    setLoading(true);
    setError(null);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };

  const handlePasswordReset = async (data: { email: string }) => {
    setResetError(null);
    setResetEmailSent(false);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(data.email);
    setLoading(false);
    if (error) setResetError(error.message);
    else setResetEmailSent(true);
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) setError(error.message);
    setLoading(false);
  };

  if (user) {
    const emailConfirmed = user.email_confirmed_at || user.email_confirmed;
    return (
      <div className="p-4 border rounded bg-white max-w-sm mx-auto mt-8">
        <p className="mb-4">Signed in as <b>{user.email}</b></p>
        {!emailConfirmed && (
          <div className="mb-4 text-yellow-600 text-sm">
            Please verify your email address. Check your inbox for a verification email.
          </div>
        )}
        <Button onClick={handleSignOut} disabled={loading}>Sign Out</Button>
      </div>
    );
  }

  if (showReset) {
    return (
      <div className="p-4 border rounded bg-white max-w-sm mx-auto mt-8">
        <h2 className="text-lg font-bold mb-4">Reset Password</h2>
        <Form {...resetForm}>
          <form onSubmit={resetForm.handleSubmit(handlePasswordReset)} className="space-y-4">
            <FormField
              control={resetForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {resetError && <div className="text-red-500 text-sm">{resetError}</div>}
            {resetEmailSent && <div className="text-green-600 text-sm">Password reset email sent! Check your inbox.</div>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Sending...' : 'Send Reset Email'}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center">
          <button
            className="text-blue-600 hover:underline text-sm"
            onClick={() => setShowReset(false)}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded bg-white max-w-sm mx-auto mt-8">
      <h2 className="text-lg font-bold mb-4">{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
      <div className="flex flex-col gap-2 mb-4">
        <Button type="button" variant="outline" className="flex items-center justify-center gap-2" onClick={() => handleOAuthSignIn('google')} disabled={loading}>
          <FaGoogle /> Sign in with Google
        </Button>
        <Button type="button" variant="outline" className="flex items-center justify-center gap-2" onClick={() => handleOAuthSignIn('github')} disabled={loading}>
          <FaGithub /> Sign in with GitHub
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
        </form>
      </Form>
      <div className="mt-4 flex flex-col items-center gap-2">
        <button
          className="text-blue-600 hover:underline text-sm"
          onClick={() => setIsSignUp((v) => !v)}
        >
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
        {!isSignUp && (
          <button
            className="text-blue-600 hover:underline text-sm"
            onClick={() => setShowReset(true)}
          >
            Forgot Password?
          </button>
        )}
      </div>
    </div>
  );
};

export default SupabaseAuth; 