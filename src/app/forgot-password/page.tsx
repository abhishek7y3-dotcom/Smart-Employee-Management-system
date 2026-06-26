'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPasswordPage() {
  const { forgotPassword, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setFormError('Email is required.');
      return;
    }

    try {
      const message = await forgotPassword({ email });
      setSuccessMessage(message);
    } catch {
      // Error state handled in context.
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 py-12 transition-colors duration-300 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Forgot Password</h1>
          <p className="mt-2.5 text-sm text-zinc-500 dark:text-zinc-400">Receive password reset instructions in your email.</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@company.com"
              className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          {(formError || error) && (
            <div className="rounded-xl bg-red-50 border border-red-200/50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-400">
              {formError || error}
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-250 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-400">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-500/10 transition duration-300 hover:bg-blue-700 hover:shadow-blue-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-blue-300 dark:disabled:bg-blue-900/45 dark:disabled:text-blue-200/70"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <div className="mt-8 border-t border-zinc-150 pt-5 text-center text-sm dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
          Remember your password?{' '}
          <a href="/login" className="font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            Login
          </a>
        </div>
      </div>
    </div>
  );
}
