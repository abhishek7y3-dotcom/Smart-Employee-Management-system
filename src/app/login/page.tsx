'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { requestLoginOtp, loginWithOtp } from '../../api/auth';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ClipboardCheck } from 'lucide-react';

type LoginTab = 'password' | 'otp';
type OtpStep = 'email' | 'code';

export default function LoginPage() {
  const { login, loading, error, persistAuth } = useAuth() as any;
  const router = useRouter();
  const [tab, setTab] = useState<LoginTab>('password');

  // --- Password login state ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // --- OTP login state ---
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState<OtpStep>('email');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpEmailError, setOtpEmailError] = useState<string | null>(null);
  const [otpCodeError, setOtpCodeError] = useState<string | null>(null);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string | null>(null);
  const [otpCooldown, setOtpCooldown] = useState(0);

  const emailRegex = /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._%+-]+(?<!\.)@[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,4}$/;

  // ── Password Login ────────────────────────────────────────────────────────
  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setEmailError(null);
    setPasswordError(null);

    let hasError = false;
    if (!email.trim()) { setEmailError('Please enter an email address.'); hasError = true; }
    else if (!emailRegex.test(email)) { setEmailError('Please enter a valid email address.'); hasError = true; }
    if (!password.trim()) { setPasswordError('Please enter your password.'); hasError = true; }
    else if (password.length < 6) { setPasswordError('Please enter a password that is at least 6 characters long.'); hasError = true; }
    if (hasError) return;

    try {
      await login({ email, password });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Invalid email or password.';
      if (msg.toLowerCase().includes('email')) setEmailError(msg);
      else if (msg.toLowerCase().includes('password')) setPasswordError(msg);
      else { setEmailError('Invalid email or password.'); setPasswordError('Invalid email or password.'); setFormError(msg); }
    }
  };

  // ── OTP Login — Step 1: Request code ─────────────────────────────────────
  const handleRequestOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOtpEmailError(null);
    if (!otpEmail.trim()) { setOtpEmailError('Please enter an email address.'); return; }
    if (!emailRegex.test(otpEmail)) { setOtpEmailError('Please enter a valid email address.'); return; }

    setOtpSending(true);
    try {
      const result = await requestLoginOtp(otpEmail);
      setOtpSuccessMsg(result.message);
      setOtpStep('code');
      setOtpCooldown(60);
      const interval = setInterval(() => {
        setOtpCooldown((prev) => { if (prev <= 1) { clearInterval(interval); return 0; } return prev - 1; });
      }, 1000);
    } catch (err: any) {
      setOtpEmailError(err.message || 'Failed to send code. Please try again.');
    } finally {
      setOtpSending(false);
    }
  };

  // ── OTP Login — Step 2: Verify code & authenticate ───────────────────────
  const handleOtpVerify = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOtpCodeError(null);
    if (otpCode.length !== 6) { setOtpCodeError('Please enter the 6-digit code.'); return; }

    setOtpVerifying(true);
    try {
      const response = await loginWithOtp(otpEmail, otpCode);
      persistAuth(response.user, response.token.accessToken);
      router.push('/');
    } catch (err: any) {
      setOtpCodeError(err.message || 'Invalid code. Please try again.');
    } finally {
      setOtpVerifying(false);
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
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-outfit">
            Employee Task Manager
          </h1>
          <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">Sign in to your workspace</p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-905 p-1 mb-7">
          <button
            type="button"
            onClick={() => { setTab('password'); setFormError(null); setEmailError(null); setPasswordError(null); }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer ${tab === 'password'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => { setTab('otp'); setOtpEmailError(null); setOtpCodeError(null); setOtpSuccessMsg(null); setOtpStep('email'); setOtpCode(''); }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer ${tab === 'otp'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
          >
            OTP
          </button>
        </div>

        {/* ── PASSWORD TAB ─────────────────────────────────────────────────── */}
        {tab === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300" htmlFor="email">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(null); setFormError(null); }}
                  placeholder="name@company.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border text-base text-zinc-900 dark:text-zinc-50 bg-white dark:bg-zinc-900 outline-none transition duration-150 focus:ring-2 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 ${emailError
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10'
                    : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-zinc-400/10'
                    }`}
                />
              </div>
              {emailError && <p className="text-sm text-red-500 dark:text-red-400 font-medium">{emailError}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300" htmlFor="password">Password</label>
                <a href="/forgot-password" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(null); setFormError(null); }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-3 rounded-lg border text-base text-zinc-900 dark:text-zinc-50 bg-white dark:bg-zinc-900 outline-none transition duration-150 focus:ring-2 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 ${passwordError
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10'
                    : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-zinc-400/10'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordError && <p className="text-sm text-red-500 dark:text-red-400 font-medium">{passwordError}</p>}
            </div>



            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 dark:bg-white px-4 py-3 text-base font-semibold text-white dark:text-zinc-900 transition-all duration-150 hover:bg-zinc-700 dark:hover:bg-zinc-100 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Signing in…' : 'Continue'} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* ── MAGIC CODE TAB ───────────────────────────────────────────────── */}
        {tab === 'otp' && (
          <>
            {otpStep === 'email' ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  We'll send a 6-digit login code to your email. No password needed.
                </p>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300" htmlFor="otp-email">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                    <input
                      id="otp-email"
                      type="email"
                      value={otpEmail}
                      onChange={(e) => { setOtpEmail(e.target.value); setOtpEmailError(null); }}
                      placeholder="name@company.com"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border text-base text-zinc-900 dark:text-zinc-50 bg-white dark:bg-zinc-900 outline-none transition duration-150 focus:ring-2 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 ${otpEmailError
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10'
                        : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-zinc-400/10'
                        }`}
                    />
                  </div>
                  {otpEmailError && <p className="text-sm text-red-500 dark:text-red-400 font-medium">{otpEmailError}</p>}
                </div>
                <button
                  type="submit"
                  disabled={otpSending}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 dark:bg-white px-4 py-3 text-base font-semibold text-white dark:text-zinc-900 transition-all duration-150 hover:bg-zinc-700 dark:hover:bg-zinc-100 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {otpSending ? 'Sending code…' : 'Send login code'} <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpVerify} className="space-y-4">
                {otpSuccessMsg && (
                  <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 px-3.5 py-2.5 text-xs text-emerald-700 dark:text-emerald-400">
                    {otpSuccessMsg}
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 text-center block" htmlFor="login-otp">
                    Enter the 6-digit code sent to <span className="font-semibold text-zinc-700 dark:text-zinc-300">{otpEmail}</span>
                  </label>
                  <input
                    id="login-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, '')); setOtpCodeError(null); }}
                    placeholder="000000"
                    className={`w-full rounded-lg border px-4 py-3 text-2xl font-mono tracking-[0.4em] text-center text-zinc-900 dark:text-zinc-50 bg-white dark:bg-zinc-900 outline-none transition duration-150 focus:ring-2 ${otpCodeError
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10'
                      : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-zinc-400/10'
                      }`}
                  />
                  {otpCodeError && <p className="text-sm text-red-500 text-center">{otpCodeError}</p>}
                </div>

                <button
                  type="submit"
                  disabled={otpCode.length !== 6 || otpVerifying}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 dark:bg-white px-4 py-3 text-base font-semibold text-white dark:text-zinc-900 transition-all duration-150 hover:bg-zinc-700 dark:hover:bg-zinc-100 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {otpVerifying ? 'Verifying…' : 'Sign in'} <ArrowRight className="h-4 w-4" />
                </button>

                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => { setOtpStep('email'); setOtpCode(''); setOtpCodeError(null); setOtpSuccessMsg(null); }}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors cursor-pointer"
                  >
                    ← Change email
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOtpStep('email'); setOtpCode(''); }}
                    disabled={otpCooldown > 0}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Resend code'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-zinc-550 dark:text-zinc-400">
          Don&apos;t have an account?{' '}
          <a href="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors">
            Create account
          </a>
        </div>
      </div>
    </div>
  );
}
