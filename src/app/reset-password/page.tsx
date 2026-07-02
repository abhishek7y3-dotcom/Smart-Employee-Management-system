'use client';

import { useState, useEffect, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { resendResetOtp } from '../../api/auth';
import { Mail, Lock, ArrowRight, Eye, EyeOff, ClipboardCheck } from 'lucide-react';

const inputBase =
  'w-full rounded-lg border text-sm text-zinc-900 dark:text-zinc-50 bg-white dark:bg-zinc-900 outline-none transition duration-150 focus:ring-2 placeholder:text-zinc-400 dark:placeholder:text-zinc-600';
const inputNormal =
  'border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-zinc-400/10';
const inputError =
  'border-red-400 focus:border-red-400 focus:ring-red-400/10';

function ResetPasswordForm() {
  const { resetPassword, loading, error } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleResendOtp = async () => {
    if (!email.trim()) {
      setResendMessage('Please enter your email first.');
      return;
    }
    setResendMessage(null);
    setResendLoading(true);
    try {
      const result = await resendResetOtp(email);
      setResendMessage(result.message || 'A new reset code has been sent.');
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setResendMessage(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

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
      setSuccessMessage(message || 'Password reset successful! Redirecting to login…');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch {
      // Error is handled in context
    }
  };

  return (
    <div className="w-full max-w-sm relative z-10">
      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm mb-5">
          <ClipboardCheck className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-outfit">
          Employee Task Manager
        </h1>
        <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
          Set a new password
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@company.com"
              className={`${inputBase} pl-10 pr-4 py-2.5 ${inputNormal}`}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 text-center block" htmlFor="otp">
            Enter the 6-digit code sent to{' '}
            {email ? (
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">{email}</span>
            ) : (
              'your email'
            )}
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className={`${inputBase} px-4 py-3 text-2xl font-mono tracking-[0.4em] text-center ${inputNormal}`}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400" htmlFor="password">
            New password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className={`${inputBase} pl-10 pr-10 py-2.5 ${inputNormal}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400" htmlFor="confirmPassword">
            Confirm new password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="••••••••"
              className={`${inputBase} pl-10 pr-10 py-2.5 ${inputNormal}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {formError && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 px-3.5 py-2.5 text-xs text-red-600 dark:text-red-400">
            {formError}
          </div>
        )}
        {error && !formError && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 px-3.5 py-2.5 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 px-3.5 py-2.5 text-xs text-emerald-700 dark:text-emerald-400">
            {successMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 dark:bg-white px-4 py-2.5 text-sm font-semibold text-white dark:text-zinc-900 transition-all duration-150 hover:bg-zinc-700 dark:hover:bg-zinc-100 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? 'Resetting password…' : 'Reset password'} <ArrowRight className="h-3.5 w-3.5" />
        </button>

        <div className="flex items-center justify-center text-xs">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendCooldown > 0 || resendLoading}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors disabled:opacity-40 cursor-pointer"
          >
            {resendLoading ? 'Sending…' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
          </button>
        </div>

        {resendMessage && (
          <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">{resendMessage}</p>
        )}
      </form>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-zinc-400 dark:text-zinc-500">
        Remember your password?{' '}
        <a href="/login" className="font-medium text-zinc-700 dark:text-zinc-200 hover:underline transition-colors">
          Sign in
        </a>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 px-4 py-16 font-sans transition-colors duration-300">
      {/* Subtle ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-600/5" />
      </div>

      <Suspense
        fallback={
          <div className="w-full max-w-sm relative z-10 flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-zinc-100" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
