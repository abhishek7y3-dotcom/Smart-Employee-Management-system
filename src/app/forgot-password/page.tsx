'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Mail, ArrowRight, ClipboardCheck } from 'lucide-react';

const emailRegex = /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._%+-]+(?<!\.)@[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,4}$/;

const inputBase =
  'w-full rounded-lg border text-base text-zinc-900 dark:text-zinc-50 bg-white dark:bg-zinc-900 outline-none transition duration-150 focus:ring-2 placeholder:text-zinc-400 dark:placeholder:text-zinc-600';
const inputNormal =
  'border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-zinc-400/10';
const inputError =
  'border-red-400 focus:border-red-400 focus:ring-red-400/10';

export default function ForgotPasswordPage() {
  const { forgotPassword, loading, error } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setEmailError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setEmailError('Email is required.');
      return;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    try {
      const message = await forgotPassword({ email });
      setSuccessMessage(message || 'Password reset OTP has been sent. Redirecting…');
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch {
      // Error state handled in context.
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 px-4 py-16 font-sans transition-colors duration-300">
      {/* Subtle ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-600/5" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm mb-5">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-outfit">
            Employee Task Manager
          </h1>
          <p className="mt-3 rounded-lg bg-zinc-100 px-4 py-2 text-base font-semibold text-zinc-900 dark:bg-zinc-800/80 dark:text-zinc-50">
            Reset your password
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Enter your email and we&apos;ll send a 6-digit code to reset your password.
          </p>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
              <input
                id="email"
                type="email"
                maxLength={254}
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setEmailError(null);
                  setFormError(null);
                }}
                placeholder="name@company.com"
                className={`${inputBase} pl-10 pr-4 py-3 ${emailError ? inputError : inputNormal}`}
              />
            </div>
            {emailError && <p className="text-sm text-red-500">{emailError}</p>}
          </div>

          {formError && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 px-3.5 py-3 text-sm text-red-600 dark:text-red-400">
              {formError}
            </div>
          )}
          {error && !formError && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 px-3.5 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 px-3.5 py-3 text-sm text-emerald-700 dark:text-emerald-400">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 dark:bg-white px-4 py-3 text-base font-semibold text-white dark:text-zinc-900 transition-all duration-150 hover:bg-zinc-700 dark:hover:bg-zinc-100 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? 'Sending code…' : 'Send reset code'} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-zinc-550 dark:text-zinc-400">
          Remember your password?{' '}
          <a href="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors">
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}
