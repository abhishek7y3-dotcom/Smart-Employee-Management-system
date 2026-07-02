'use client';

import { useState, FormEvent, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { verifyOtp, resendVerificationOtp } from '../../api/auth';
import { Eye, EyeOff, Lock, Mail, User, Image as ImageIcon, ClipboardCheck, ArrowRight } from 'lucide-react';

const emailRegex = /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._%+-]+(?<!\.)@[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,4}$/;

const inputBase =
  'w-full rounded-lg border text-base text-zinc-900 dark:text-zinc-50 bg-white dark:bg-zinc-900 outline-none transition duration-150 focus:ring-2 placeholder:text-zinc-400 dark:placeholder:text-zinc-600';
const inputNormal =
  'border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-zinc-400/10';
const inputError =
  'border-red-400 focus:border-red-400 focus:ring-red-400/10';

export default function RegisterPage() {
  const { register, loading, error } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setFormError('Image size must be less than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
        setFormError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);

    let hasError = false;

    if (!name.trim()) {
      setNameError('Name is required.');
      hasError = true;
    }

    if (!email.trim()) {
      setEmailError('Email is required.');
      hasError = true;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.');
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError('Password is required.');
      hasError = true;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      hasError = true;
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Please confirm your password.');
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords must match.');
      hasError = true;
    }

    if (hasError) return;

    try {
      const message = await register({ name, email, password, profilePicture });
      setSuccessMessage(message || 'Registration successful! Please verify using the 6-digit code.');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed.';
      if (msg.toLowerCase().includes('email')) {
        setEmailError(msg);
      } else {
        setFormError(msg);
      }
    }
  };

  const handleResendOtp = async () => {
    setResendMessage(null);
    setResendLoading(true);
    try {
      const result = await resendVerificationOtp(email);
      setResendMessage(result.message || 'A new code has been sent.');
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

  const handleOtpSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOtpError(null);

    if (otp.length !== 6) {
      setOtpError('Please enter a 6-digit code.');
      return;
    }

    setOtpLoading(true);
    try {
      await verifyOtp(email, otp);
      setOtpSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setOtpError(err.message || 'Verification failed. Please try again.');
    } finally {
      setOtpLoading(false);
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
          <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
            {successMessage ? 'Verify your email to continue' : 'Create your workspace account'}
          </p>
        </div>

        {successMessage ? (
          otpSuccess ? (
            <div className="space-y-4 text-center">
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 px-3.5 py-4 text-sm text-emerald-700 dark:text-emerald-400">
                <p className="font-semibold text-base mb-1">Email verified</p>
                <p>Your account is verified. Redirecting to login…</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-5">
              {successMessage && (
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 px-3.5 py-3 text-sm text-emerald-700 dark:text-emerald-400">
                  {successMessage}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300 text-center block" htmlFor="otp">
                  Enter the 6-digit code sent to{' '}
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">{email}</span>
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setOtpError(null); }}
                  placeholder="000000"
                  className={`${inputBase} px-4 py-3 text-2xl font-mono tracking-[0.4em] text-center ${
                    otpError ? inputError : inputNormal
                  }`}
                />
                {otpError && <p className="text-sm text-red-500 text-center">{otpError}</p>}
              </div>

              <button
                type="submit"
                disabled={otp.length !== 6 || otpLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 dark:bg-white px-4 py-3 text-base font-semibold text-white dark:text-zinc-900 transition-all duration-150 hover:bg-zinc-700 dark:hover:bg-zinc-100 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {otpLoading ? 'Verifying…' : 'Verify email'} <ArrowRight className="h-4 w-4" />
              </button>

              <div className="flex items-center justify-center text-sm">
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
                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{resendMessage}</p>
              )}
            </form>
          )
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300" htmlFor="name">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => { setName(event.target.value); setNameError(null); setFormError(null); }}
                  placeholder="John Doe"
                  className={`${inputBase} pl-10 pr-4 py-3 ${nameError ? inputError : inputNormal}`}
                />
              </div>
              {nameError && <p className="text-sm text-red-500">{nameError}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => { setEmail(event.target.value); setEmailError(null); setFormError(null); }}
                  placeholder="name@company.com"
                  className={`${inputBase} pl-10 pr-4 py-3 ${emailError ? inputError : inputNormal}`}
                />
              </div>
              {emailError && <p className="text-sm text-red-500">{emailError}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => { setPassword(event.target.value); setPasswordError(null); setFormError(null); }}
                  placeholder="••••••••"
                  className={`${inputBase} pl-10 pr-10 py-3 ${passwordError ? inputError : inputNormal}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300" htmlFor="confirmPassword">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => { setConfirmPassword(event.target.value); setConfirmPasswordError(null); setFormError(null); }}
                  placeholder="••••••••"
                  className={`${inputBase} pl-10 pr-10 py-3 ${confirmPasswordError ? inputError : inputNormal}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPasswordError && <p className="text-sm text-red-500">{confirmPasswordError}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300" htmlFor="profile-pic">
                Profile picture <span className="text-zinc-400 dark:text-zinc-600">(optional)</span>
              </label>
              <div className={`flex items-center gap-3 rounded-lg border px-3 py-3 bg-white dark:bg-zinc-900 transition duration-150 ${
                formError?.includes('Image') ? 'border-red-400' : 'border-zinc-200 dark:border-zinc-800'
              }`}>
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile preview" className="h-8 w-8 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                    <ImageIcon className="h-3.5 w-3.5" />
                  </div>
                )}
                <input
                  id="profile-pic"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm text-zinc-500 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-2.5 file:py-1.5 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200 dark:text-zinc-400 dark:file:bg-zinc-800 dark:file:text-zinc-200 dark:hover:file:bg-zinc-700 cursor-pointer"
                />
              </div>
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

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 dark:bg-white px-4 py-3 text-base font-semibold text-white dark:text-zinc-900 transition-all duration-150 hover:bg-zinc-700 dark:hover:bg-zinc-100 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Creating account…' : 'Create account'} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
          Already have an account?{' '}
          <a href="/login" className="font-medium text-zinc-700 dark:text-zinc-200 hover:underline transition-colors">
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}
