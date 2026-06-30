'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { verifyOtp } from '../../api/auth';

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

  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setFormError('Image size must be less than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setFormError('Please complete all fields.');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords must match.');
      return;
    }

    try {
      const message = await register({ name, email, password, profilePicture });
      setSuccessMessage(message || 'Registration successful! Please verify using the 6-digit code.');
    } catch {
      // Context error is displayed.
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 font-outfit">Create Account</h1>
          <p className="mt-2 text-xs text-zinc-450 dark:text-zinc-500">Join the Employee Task Manager workspace</p>
        </div>

        {successMessage ? (
          <div className="mt-8 text-center space-y-6 relative z-10">
            {otpSuccess ? (
              <div className="space-y-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/50 shadow-sm">
                  <svg className="h-8 w-8 text-emerald-605 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 font-outfit">Email Verified!</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-405 leading-relaxed">
                    Your account has been successfully verified. Redirecting to login...
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-6 text-left">
                <div className="text-center space-y-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 text-blue-650 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/50">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 font-outfit">Verify Your Email</h2>
                  <p className="text-xs text-zinc-450 dark:text-zinc-500">
                    We sent a 6-digit verification code to <span className="font-semibold text-zinc-700 dark:text-zinc-300">{email}</span>.
                  </p>
                </div>

                <div className="space-y-2">
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
                    required
                    className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-3xl font-mono tracking-[0.5em] text-center text-zinc-950 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700/80 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-blue-500"
                  />
                </div>

                {otpError && (
                  <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/50 px-4 py-3 text-xs text-red-700 dark:text-red-400">
                    {otpError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={otp.length !== 6 || otpLoading}
                  className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3.5 text-xs font-bold text-white shadow-md shadow-blue-500/15 transition duration-300 hover:bg-blue-700 hover:shadow-blue-500/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-blue-300 dark:disabled:bg-blue-900/40 dark:disabled:text-blue-200/50 cursor-pointer"
                >
                  {otpLoading ? 'Verifying...' : 'Verify Code'}
                </button>

                <p className="text-center text-[11px] text-zinc-450 dark:text-zinc-500">
                  Didn't receive the email? Check your spam folder or register again.
                </p>
              </form>
            )}
          </div>
        ) : (
          <form className="mt-8 space-y-5 relative z-10" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500" htmlFor="name">
                Full Name
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-950 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700/80 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-blue-500"
                />
              </div>
            </div>

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

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500" htmlFor="profile-pic">
                Profile Picture
              </label>
              <div className="mt-2 flex items-center gap-4">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Preview"
                    className="h-12 w-12 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 ring-2 ring-zinc-100 dark:ring-zinc-800"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-zinc-300 bg-zinc-50/50 text-zinc-450 dark:border-zinc-700 dark:bg-zinc-950/40">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <input
                  id="profile-pic"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-950/40 dark:file:text-blue-400 file:cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500" htmlFor="password">
                Password
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-950 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700/80 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-950 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700/80 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-blue-500"
                />
              </div>
            </div>

            {(formError || error) && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/50 px-4 py-3 text-xs text-red-700 dark:text-red-400">
                {formError || error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3.5 text-xs font-bold text-white shadow-md shadow-blue-500/15 transition duration-300 hover:bg-blue-700 hover:shadow-blue-500/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-blue-300 dark:disabled:bg-blue-900/40 dark:disabled:text-blue-200/50 cursor-pointer"
            >
              {loading ? 'Registering...' : 'Create account'}
            </button>
          </form>
        )}

        <div className="mt-8 border-t border-zinc-200/80 pt-5 text-center text-xs dark:border-zinc-800/80 text-zinc-600 dark:text-zinc-400 relative z-10">
          Already have an account?{' '}
          <a href="/login" className="font-bold text-blue-600 transition hover:text-blue-750 dark:text-blue-400 dark:hover:text-blue-300">
            Login
          </a>
        </div>
      </div>
    </div>
  );
}
