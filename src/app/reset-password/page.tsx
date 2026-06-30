'use client';

import { useState, useEffect, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

function ResetPasswordForm() {
  const { resetPassword, loading, error } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!email.trim() || !otp.trim() || !password.trim() || !confirmPassword.trim()) {
      setFormError('Please complete all fields.');
      return;
    }

    if (otp.length !== 6) {
      setFormError('Please enter a valid 6-digit verification code.');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    try {
      const message = await resetPassword({ email, otp, password });
      setSuccessMessage(message || 'Password reset successful! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch {
      // Error is handled in context
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-zinc-200/85 bg-white/95 p-8 shadow-2xl shadow-zinc-200/50 dark:shadow-zinc-950/50 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/90 relative overflow-hidden transition-all duration-300 hover:scale-[1.01]">
      {/* Decorative corner glows */}
      <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl pointer-events-none"></div>
      <div className="absolute -left-16 -bottom-16 w-32 h-32 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none"></div>

      <div className="text-center relative z-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20 mb-4 hover:scale-105 transition-all duration-300">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 font-outfit">Reset Password</h1>
        <p className="mt-2.5 text-xs text-zinc-455 dark:text-zinc-500">Enter the verification code and set your new password.</p>
      </div>

      <form className="mt-8 space-y-5 relative z-10" onSubmit={handleSubmit}>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@company.com"
            className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-xs text-zinc-950 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700/80 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 text-center" htmlFor="otp">
            Verification Code
          </label>
          <input
            id="otp"
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-2xl font-mono tracking-[0.4em] text-center text-zinc-950 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700/80 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500" htmlFor="password">
            New Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-xs text-zinc-955 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700/80 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500" htmlFor="confirmPassword">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="••••••••"
            className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-xs text-zinc-955 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700/80 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-blue-500"
          />
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
          {loading ? 'Resetting Password...' : 'Reset Password'}
        </button>
      </form>

      <div className="mt-8 border-t border-zinc-200/80 pt-5 text-center text-xs dark:border-zinc-800/80 relative z-10">
        <a href="/login" className="font-bold text-blue-600 transition hover:text-blue-750 dark:text-blue-400 dark:hover:text-blue-300">
          Back to Login
        </a>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50/50 px-4 py-12 transition-colors duration-300 dark:bg-zinc-950 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-120 h-120 rounded-full bg-blue-500/10 blur-3xl pointer-events-none dark:bg-blue-600/5"></div>
      <div className="absolute -bottom-40 -right-40 w-120 h-120 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none dark:bg-indigo-600/5"></div>

      <Suspense fallback={
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900/50 flex items-center justify-center backdrop-blur-md">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
