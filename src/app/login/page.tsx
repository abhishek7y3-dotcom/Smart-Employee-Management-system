'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { requestLoginOtp, loginWithOtp } from '../../api/auth';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ClipboardCheck, Phone, Clock, ArrowLeft } from 'lucide-react';

type LoginMode = 'initial' | 'email' | 'phone';
type SubTab = 'password' | 'otp';

const countries = [
  { name: 'India', code: '+91', flag: 'IN' },
  { name: 'United States', code: '+1', flag: 'US' },
  { name: 'United Kingdom', code: '+44', flag: 'UK' },
  { name: 'Canada', code: '+1', flag: 'CA' },
  { name: 'Australia', code: '+61', flag: 'AU' },
  { name: 'Germany', code: '+49', flag: 'DE' },
  { name: 'France', code: '+33', flag: 'FR' },
  { name: 'Singapore', code: '+65', flag: 'SG' },
  { name: 'Japan', code: '+81', flag: 'JP' },
];

export default function LoginPage() {
  const { login, loading, error, persistAuth } = useAuth() as any;
  const router = useRouter();

  // Navigation mode: 'initial' -> choose email/phone. 'email' -> email options. 'phone' -> phone options.
  const [mode, setMode] = useState<LoginMode>('initial');
  const [subTab, setSubTab] = useState<SubTab>('password');

  // Common inputs
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Email specific states
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Phone specific states
  const [mobileNumber, setMobileNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileError, setMobileError] = useState<string | null>(null);

  // OTP specific states (Used for both email OTP and phone OTP)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpCodeError, setOtpCodeError] = useState<string | null>(null);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string | null>(null);
  const [otpTimer, setOtpTimer] = useState(0); // 120s countdown

  const emailRegex = /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._%+-]+(?<!\.)@[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,4}$/;

  // ── OTP Timer ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset errors when mode/tab changes
  const resetErrors = () => {
    setFormError(null);
    setEmailError(null);
    setPasswordError(null);
    setMobileError(null);
    setOtpCodeError(null);
    setOtpSuccessMsg(null);
    setIsOtpSent(false);
    setOtpDigits(['', '', '', '', '', '']);
  };

  // ── PASSWORD LOGIN (Email or Phone) ────────────────────────────────────────
  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setEmailError(null);
    setPasswordError(null);
    setMobileError(null);

    let hasError = false;

    if (mode === 'email') {
      if (!email.trim()) { setEmailError('Please enter an email address.'); hasError = true; }
      else if (!emailRegex.test(email)) { setEmailError('Please enter a valid email address.'); hasError = true; }
    } else {
      if (!mobileNumber.trim()) { setMobileError('Please enter a mobile number.'); hasError = true; }
      else if (mobileNumber.length !== 10) { setMobileError('Mobile number must be exactly 10 digits.'); hasError = true; }
      else if (mobileNumber.startsWith('0')) { setMobileError('Mobile number should never start with 0.'); hasError = true; }
    }

    if (!password.trim()) { setPasswordError('Please enter your password.'); hasError = true; }
    else if (password.length < 6) { setPasswordError('Password must be at least 6 characters.'); hasError = true; }

    if (hasError) return;

    try {
      if (mode === 'email') {
        await login({ email, password });
      } else {
        await login({ mobileNumber, countryCode, password });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Invalid login credentials.';
      if (msg.toLowerCase().includes('email')) setEmailError(msg);
      else if (msg.toLowerCase().includes('password')) setPasswordError(msg);
      else if (msg.toLowerCase().includes('mobile') || msg.toLowerCase().includes('phone')) setMobileError(msg);
      else { setFormError(msg); }
    }
  };

  // ── OTP Change & Autotab ──────────────────────────────────────────────────
  const handleMobileChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(digitsOnly);
    setMobileError(null);
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) {
      const nextDigits = [...otpDigits];
      nextDigits[index] = '';
      setOtpDigits(nextDigits);
      return;
    }

    const nextDigits = [...otpDigits];
    nextDigits[index] = numericValue.slice(-1);
    setOtpDigits(nextDigits);

    if (index < 5) {
      const nextInput = document.getElementById(`login-otp-${index + 1}`);
      if (nextInput) (nextInput as HTMLInputElement).focus();
    }
  };

  const handleOtpDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`login-otp-${index - 1}`);
      if (prevInput) {
        (prevInput as HTMLInputElement).focus();
      }
    }
  };

  // ── REQUEST OTP (Email or Phone) ──────────────────────────────────────────
  const handleRequestOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError(null);
    setMobileError(null);

    let payload: { email?: string; mobileNumber?: string; countryCode?: string } = {};

    if (mode === 'email') {
      if (!email.trim()) { setEmailError('Please enter an email address.'); return; }
      if (!emailRegex.test(email)) { setEmailError('Please enter a valid email address.'); return; }
      payload.email = email;
    } else {
      if (!mobileNumber.trim()) { setMobileError('Please enter a mobile number.'); return; }
      if (mobileNumber.length !== 10) { setMobileError('Mobile number must be exactly 10 digits.'); return; }
      if (mobileNumber.startsWith('0')) { setMobileError('Mobile number should never start with 0.'); return; }
      payload.mobileNumber = mobileNumber;
      payload.countryCode = countryCode;
    }

    setOtpSending(true);
    try {
      const result = await requestLoginOtp(payload);
      setOtpSuccessMsg(result.message);
      setIsOtpSent(true);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpTimer(120); // 2 minutes
    } catch (err: any) {
      const msg = err.message || 'Failed to send OTP code. Please verify credentials.';
      if (mode === 'email') setEmailError(msg);
      else setMobileError(msg);
    } finally {
      setOtpSending(false);
    }
  };

  // ── VERIFY OTP (Email or Phone) ───────────────────────────────────────────
  const handleOtpVerify = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOtpCodeError(null);

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setOtpCodeError('Please enter the 6-digit code.');
      return;
    }
    if (otpTimer <= 0) {
      setOtpCodeError('Verification code has expired. Please request a new OTP.');
      return;
    }

    setOtpVerifying(true);
    try {
      let response;
      if (mode === 'email') {
        response = await loginWithOtp({ email, otp: fullOtp });
      } else {
        response = await loginWithOtp({ mobileNumber, countryCode, otp: fullOtp });
      }
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
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-600/5" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm mb-4">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-outfit">
            Employee Task Manager
          </h1>
          <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">Sign in to your workspace</p>
        </div>

        {/* ── 1. INITIAL METHOD CHOICE SCREEN ────────────────────────────────── */}
        {mode === 'initial' && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => { setMode('email'); setSubTab('password'); resetErrors(); }}
              className="flex w-full items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-50 dark:bg-zinc-900/60 dark:hover:bg-zinc-900 px-5 py-4 text-sm font-bold text-zinc-800 dark:text-zinc-200 transition shadow-sm cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-500" /> Continue with Email
              </span>
              <ArrowRight className="h-4 w-4 text-zinc-450" />
            </button>

            <button
              type="button"
              onClick={() => { setMode('phone'); setSubTab('password'); resetErrors(); }}
              className="flex w-full items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-50 dark:bg-zinc-900/60 dark:hover:bg-zinc-900 px-5 py-4 text-sm font-bold text-zinc-800 dark:text-zinc-200 transition shadow-sm cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-emerald-500" /> Continue with Phone Number
              </span>
              <ArrowRight className="h-4 w-4 text-zinc-450" />
            </button>
          </div>
        )}

        {/* ── 2. SUB-OPTIONS SCREEN (Email or Phone) ────────────────────────── */}
        {mode !== 'initial' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Go Back to Initial Choice */}
            <button
              type="button"
              onClick={() => { setMode('initial'); resetErrors(); }}
              className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-850 dark:text-zinc-400 dark:hover:text-zinc-200 transition cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to options
            </button>

            {/* Sub-tab selection: Password vs OTP */}
            <div className="flex rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-1">
              <button
                type="button"
                onClick={() => { setSubTab('password'); resetErrors(); }}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${subTab === 'password'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700'
                  }`}
              >
                Login with Password
              </button>
              <button
                type="button"
                onClick={() => { setSubTab('otp'); resetErrors(); }}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${subTab === 'otp'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700'
                  }`}
              >
                Login with OTP
              </button>
            </div>

            {formError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400 font-semibold animate-in slide-in-from-top-1">
                {formError}
              </div>
            )}

            {/* ── SUB-TAB: PASSWORD LOGIN ───────────────────────────────────── */}
            {subTab === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {mode === 'email' ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300" htmlFor="email-input">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                      <input
                        id="email-input"
                        type="text"
                        maxLength={254}
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setEmailError(null); setFormError(null); }}
                        placeholder="name@company.com"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-zinc-900 dark:text-zinc-50 bg-white dark:bg-zinc-900 outline-none transition focus:ring-2 placeholder:text-zinc-400 ${emailError ? 'border-red-400 focus:ring-red-400/20' : 'border-zinc-200 dark:border-zinc-800 focus:border-blue-500 focus:ring-blue-500/20'}`}
                      />
                    </div>
                    {emailError && <p className="text-sm text-red-500 font-semibold">{emailError}</p>}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300" htmlFor="mobile-input">Mobile Number</label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-2 text-xs text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none shrink-0 cursor-pointer font-semibold"
                      >
                        {countries.map((c) => (
                          <option key={c.name} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                        <input
                          id="mobile-input"
                          type="text"
                          inputMode="numeric"
                          value={mobileNumber}
                          onChange={(e) => handleMobileChange(e.target.value)}
                          placeholder="10-digit number"
                          className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-zinc-50 outline-none transition focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${mobileError ? 'border-red-400 focus:ring-red-400/20' : 'border-zinc-200 dark:border-zinc-800'}`}
                        />
                      </div>
                    </div>
                    {mobileError && <p className="text-sm text-red-500 font-semibold">{mobileError}</p>}
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300" htmlFor="password-input">Password</label>
                    <a href="/forgot-password" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-750 dark:hover:text-blue-300 hover:underline transition">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                    <input
                      id="password-input"
                      type={showPassword ? 'text' : 'password'}
                      maxLength={128}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setPasswordError(null); setFormError(null); }}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-zinc-900 dark:text-zinc-50 bg-white dark:bg-zinc-900 outline-none transition focus:ring-2 placeholder:text-zinc-400 ${passwordError ? 'border-red-400 focus:ring-red-400/20' : 'border-zinc-200 dark:border-zinc-800 focus:border-blue-500 focus:ring-blue-500/20'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordError && <p className="text-sm text-red-500 font-semibold">{passwordError}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-white px-4 py-2.5 text-xs font-bold text-white dark:text-zinc-900 transition hover:bg-zinc-755 dark:hover:bg-zinc-100 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? 'Signing in…' : 'Sign In'} <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}

            {/* ── SUB-TAB: OTP LOGIN ────────────────────────────────────────── */}
            {subTab === 'otp' && (
              <>
                {!isOtpSent ? (
                  // Step 1: Input details
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    {mode === 'email' ? (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300" htmlFor="email-otp-input">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                          <input
                            id="email-otp-input"
                            type="text"
                            maxLength={254}
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
                            placeholder="name@company.com"
                            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-zinc-900 dark:text-zinc-50 bg-white dark:bg-zinc-900 outline-none transition focus:ring-2 placeholder:text-zinc-400 ${emailError ? 'border-red-400 focus:ring-red-400/20' : 'border-zinc-200 dark:border-zinc-800 focus:border-blue-500 focus:ring-blue-500/20'}`}
                          />
                        </div>
                        {emailError && <p className="text-sm text-red-500 font-semibold">{emailError}</p>}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300" htmlFor="mobile-otp-input">Mobile Number</label>
                        <div className="flex gap-2">
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-2 text-xs text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none shrink-0 cursor-pointer font-semibold"
                          >
                            {countries.map((c) => (
                              <option key={c.name} value={c.code}>
                                {c.flag} {c.code}
                              </option>
                            ))}
                          </select>
                          <div className="relative flex-1">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                            <input
                              id="mobile-otp-input"
                              type="text"
                              inputMode="numeric"
                              value={mobileNumber}
                              onChange={(e) => handleMobileChange(e.target.value)}
                              placeholder="10-digit number"
                              className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-zinc-50 outline-none transition focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${mobileError ? 'border-red-400 focus:ring-red-400/20' : 'border-zinc-200 dark:border-zinc-800'}`}
                            />
                          </div>
                        </div>
                        {mobileError && <p className="text-sm text-red-500 font-semibold">{mobileError}</p>}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={otpSending}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-white px-4 py-2.5 text-xs font-bold text-white dark:text-zinc-900 transition hover:bg-zinc-755 dark:hover:bg-zinc-100 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {otpSending ? 'Sending OTP…' : 'Send Login OTP'} <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                ) : (
                  // Step 2: Verify code & expiry countdown
                  <form onSubmit={handleOtpVerify} className="space-y-5">
                    {otpSuccessMsg && (
                      <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 px-3.5 py-2.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                        {otpSuccessMsg}
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          Enter the 6-digit code
                        </label>
                        {otpTimer > 0 ? (
                          <span className="text-xs text-blue-650 dark:text-blue-455 font-bold flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 animate-pulse" /> {formatTimer(otpTimer)}
                          </span>
                        ) : (
                          <span className="text-xs text-red-500 font-bold">Expired</span>
                        )}
                      </div>

                      {/* Digit Box Input Layout */}
                      <div className="flex justify-center gap-2.5">
                        {otpDigits.map((digit, idx) => (
                          <input
                            key={idx}
                            id={`login-otp-${idx}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            disabled={otpTimer <= 0}
                            onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpDigitKeyDown(idx, e)}
                            className="w-12 h-12 text-center text-xl font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:opacity-50 text-zinc-950 dark:text-zinc-50"
                          />
                        ))}
                      </div>

                      {otpCodeError && <p className="text-sm text-red-500 font-semibold text-center">{otpCodeError}</p>}
                      {otpTimer <= 0 && (
                        <p className="text-sm text-red-500 font-semibold text-center">OTP expired. Please go back and request a new code.</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={otpDigits.some((d) => !d) || otpVerifying || otpTimer <= 0}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-white px-4 py-2.5 text-xs font-bold text-white dark:text-zinc-900 transition hover:bg-zinc-755 dark:hover:bg-zinc-100 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {otpVerifying ? 'Verifying…' : 'Sign In'} <ArrowRight className="h-4 w-4" />
                    </button>

                    <div className="flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => { setIsOtpSent(false); setOtpDigits(['', '', '', '', '', '']); setOtpCodeError(null); setOtpSuccessMsg(null); }}
                        className="text-xs font-bold text-blue-650 dark:text-blue-450 hover:underline cursor-pointer"
                      >
                        ← Change input details
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
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
