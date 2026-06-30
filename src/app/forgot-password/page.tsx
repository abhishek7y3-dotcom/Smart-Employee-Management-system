'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPasswordPage() {
  const { forgotPassword, loading, error } = useAuth();
  const router = useRouter();
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
      setSuccessMessage(message || 'Password reset OTP has been sent. Redirecting...');
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch {
      // Error state handled in context.
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50/50 px-4 py-12 transition-colors duration-300 dark:bg-zinc-950 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-120 h-120 rounded-full bg-blue-500/10 blur-3xl pointer-events-none dark:bg-blue-600/5"></div>
      <div className="absolute -bottom-40 -right-40 w-120 h-120 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none dark:bg-indigo-600/5"></div>

      <div className="w-full max-w-md rounded-3xl border border-zinc-200/85 bg-white/95 p-8 shadow-2xl shadow-zinc-200/50 dark:shadow-zinc-950/50 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/90 relative overflow-hidden transition-all duration-300 hover:scale-[1.01]">
        {/* Decorative corner glows */}
        <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-32 h-32 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none"></div>

        <div className="text-center relative z-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20 mb-4 hover:scale-105 transition-all duration-300">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2V4a2 2 0 00-2-2h-3a2 2 0 00-2 2v3m2 4H5a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2h-3m-6 0h.01M12 17h.01" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 font-outfit">Forgot Password</h1>
          <p className="mt-2.5 text-xs text-zinc-450 dark:text-zinc-500">Request a verification code to reset your password</p>
        </div>

        <form className="mt-8 space-y-5 relative z-10" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500" htmlFor="email">
              Email Address
            </label>
            <div className="mt-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@company.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-950 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700/80 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-blue-500"
              />
            </div>
          </div>

          {(formError || error) && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/50 px-4 py-3 text-xs text-red-700 dark:text-red-400">
              {formError || error}
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/50 px-4 py-3 text-xs text-emerald-700 dark:text-emerald-400">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3.5 text-xs font-bold text-white shadow-md shadow-blue-500/15 transition duration-300 hover:bg-blue-700 hover:shadow-blue-500/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-blue-300 dark:disabled:bg-blue-900/40 dark:disabled:text-blue-200/50 cursor-pointer"
          >
            {loading ? 'Sending OTP...' : 'Send reset code'}
          </button>
        </form>

        <div className="mt-8 border-t border-zinc-200/80 pt-5 text-center text-xs dark:border-zinc-800/80 text-zinc-600 dark:text-zinc-400 relative z-10">
          Remember your password?{' '}
          <a href="/login" className="font-bold text-blue-600 transition hover:text-blue-750 dark:text-blue-400 dark:hover:text-blue-300">
            Login
          </a>
        </div>
      </div>
    </div>
  );
}
