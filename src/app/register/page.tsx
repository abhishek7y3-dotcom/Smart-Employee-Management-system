'use client';

import { useState, FormEvent, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { verifyOtp, resendVerificationOtp } from '../../api/auth';
import { Eye, EyeOff, Lock, Mail, User, Image as ImageIcon, ClipboardCheck, ArrowRight, Phone } from 'lucide-react';

const emailRegex = /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._%+-]+(?<!\.)@[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,4}$/;

const inputBase =
  'w-full rounded-xl border text-sm text-zinc-950 dark:text-zinc-50 bg-white dark:bg-zinc-900 outline-none transition duration-150 focus:ring-2 placeholder:text-zinc-400 dark:placeholder:text-zinc-600';
const inputNormal =
  'border-zinc-200 dark:border-zinc-800 focus:border-blue-500 focus:ring-blue-500/20';
const inputError =
  'border-red-400 focus:border-red-400 focus:ring-red-400/20';

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

export default function RegisterPage() {
  const { register, loading, error } = useAuth();
  const router = useRouter();

  // Registration states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [gender, setGender] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');

  // OTP Verification digits (6 separate boxes)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  // UI States
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [mobileError, setMobileError] = useState<string | null>(null);
  const [genderError, setGenderError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const handleFirstNameChange = (val: string) => {
    const noSpaces = val.replace(/\s/g, '');
    setFirstName(noSpaces);
    setFirstNameError(null);
  };

  const handleMobileChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(digitsOnly);
    setMobileError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    setFirstNameError(null);
    setLastNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    setMobileError(null);
    setGenderError(null);

    let hasError = false;

    const nameRegex = /^[a-zA-Z][a-zA-Z.'-]*$/;

    if (!firstName.trim()) {
      setFirstNameError('Please enter your first name.');
      hasError = true;
    } else if (firstName.trim().length < 2) {
      setFirstNameError('First name must be at least 2 characters.');
      hasError = true;
    } else if (!nameRegex.test(firstName)) {
      setFirstNameError("First name must start with a letter and contain only letters, dots, quotes, and hyphens.");
      hasError = true;
    }

    if (!lastName.trim()) {
      setLastNameError('please enter your last name.');
      hasError = true;
    } else if (lastName.startsWith(' ')) {
      setLastNameError('Last name cannot start with a space.');
      hasError = true;
    } else if (/\d/.test(lastName)) {
      setLastNameError('Last name cannot contain numbers.');
      hasError = true;
    } else if (!nameRegex.test(lastName)) {
      setLastNameError("Last name must start with a letter and contain only letters, dots, quotes, and hyphens.");
      hasError = true;
    }

    if (!gender) {
      setGenderError('Please select your gender.');
      hasError = true;
    }

    if (!mobileNumber.trim()) {
      setMobileError('Please enter your Mobile number.');
      hasError = true;
    } else if (mobileNumber.length !== 10) {
      setMobileError('Mobile number must be exactly 10 digits.');
      hasError = true;
    } else if (mobileNumber.startsWith('0')) {
      setMobileError('Mobile number should never start with 0.');
      hasError = true;
    }

    if (!email.trim()) {
      setEmailError('Please enter an email address.');
      hasError = true;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.');
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError('Please enter your password.');
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
      const message = await register({
        firstName,
        lastName,
        gender,
        mobileNumber,
        countryCode,
        email,
        password,
        profilePicture
      });
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

    if (index < 5 && numericValue) {
      const nextInput = document.getElementById(`otp-digit-${index + 1}`);
      if (nextInput) (nextInput as HTMLInputElement).focus();
    }
  };

  const handleOtpDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-digit-${index - 1}`);
      if (prevInput) {
        (prevInput as HTMLInputElement).focus();
      }
    }
  };

  const handleOtpSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOtpError(null);

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setOtpError('Please enter the 6-digit code.');
      return;
    }

    setOtpLoading(true);
    try {
      await verifyOtp(email, fullOtp);
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

      <div className="w-full max-w-md relative z-10">
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
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 px-4 py-6 text-sm text-emerald-700 dark:text-emerald-400 animate-in zoom-in-95">
                <p className="font-semibold text-base mb-1">Email verified</p>
                <p>Your account is verified. Redirecting to login…</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-5">
              {successMessage && (
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 px-3.5 py-3 text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                  {successMessage}
                </div>
              )}

              <div className="space-y-3">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 text-center block">
                  Enter the 6-digit code sent to{' '}
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{email}</span>
                </label>

                <div className="flex justify-center gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-digit-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpDigitKeyDown(idx, e)}
                      className="w-12 h-12 text-center text-xl font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-zinc-950 dark:text-zinc-50"
                    />
                  ))}
                </div>

                {otpError && <p className="text-sm text-red-500 font-semibold text-center">{otpError}</p>}
              </div>

              <button
                type="submit"
                disabled={otpDigits.some((d) => !d) || otpLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-white px-4 py-3 text-base font-semibold text-white dark:text-zinc-900 transition-all duration-150 hover:bg-zinc-700 dark:hover:bg-zinc-100 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {otpLoading ? 'Verifying…' : 'Verify email'} <ArrowRight className="h-4 w-4" />
              </button>

              <div className="flex items-center justify-center text-sm">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || resendLoading}
                  className="text-zinc-400 hover:text-zinc-650 transition-colors disabled:opacity-40 cursor-pointer text-sm font-semibold"
                >
                  {resendLoading ? 'Sending…' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                </button>
              </div>

              {resendMessage && (
                <p className="text-center text-sm text-zinc-550 dark:text-zinc-400 font-medium">{resendMessage}</p>
              )}
            </form>
          )
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300" htmlFor="firstName">
                  First name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  <input
                    id="firstName"
                    type="text"
                    maxLength={50}
                    value={firstName}
                    onChange={(e) => handleFirstNameChange(e.target.value)}
                    placeholder="John"
                    className={`${inputBase} pl-10 pr-3.5 py-2.5 ${firstNameError ? inputError : inputNormal}`}
                  />
                </div>
                {firstNameError && <p className="text-sm text-red-500 font-semibold">{firstNameError}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300" htmlFor="lastName">
                  Last name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  <input
                    id="lastName"
                    type="text"
                    maxLength={50}
                    value={lastName}
                    onChange={(e) => {
                      let val = e.target.value;
                      val = val.replace(/\d/g, '');
                      if (val.startsWith(' ')) {
                        val = val.trimStart();
                      }
                      setLastName(val);
                      setLastNameError(null);
                    }}
                    placeholder="Doe"
                    className={`${inputBase} pl-10 pr-3.5 py-2.5 ${lastNameError ? inputError : inputNormal}`}
                  />
                </div>
                {lastNameError && <p className="text-sm text-red-500 font-semibold">{lastNameError}</p>}
              </div>
            </div>

            {/* Gender Select Dropdown */}
            <div className="space-y-1">
              <label htmlFor="gender" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Gender
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => { setGender(e.target.value); setGenderError(null); }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {genderError && <p className="text-sm text-red-500 font-semibold">{genderError}</p>}
            </div>

            {/* Country Selector Dropdown & Mobile Number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300" htmlFor="mobile">
                Mobile Number
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-2.5 text-xs text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none shrink-0 cursor-pointer font-semibold"
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
                    id="mobile"
                    type="text"
                    inputMode="numeric"
                    value={mobileNumber}
                    onChange={(e) => handleMobileChange(e.target.value)}
                    placeholder="10-digit number"
                    className={`${inputBase} pl-10 pr-3.5 py-2.5 ${mobileError ? inputError : inputNormal}`}
                  />
                </div>
              </div>
              {mobileError && <p className="text-sm text-red-500 font-semibold">{mobileError}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  id="email"
                  type="text"
                  maxLength={254}
                  value={email}
                  onChange={(event) => { setEmail(event.target.value); setEmailError(null); setFormError(null); }}
                  placeholder="name@company.com"
                  className={`${inputBase} pl-10 pr-3.5 py-2.5 ${emailError ? inputError : inputNormal}`}
                />
              </div>
              {emailError && <p className="text-sm text-red-500 font-semibold">{emailError}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  maxLength={128}
                  value={password}
                  onChange={(event) => { setPassword(event.target.value); setPasswordError(null); setFormError(null); }}
                  placeholder="••••••••"
                  className={`${inputBase} pl-10 pr-10 py-2.5 ${passwordError ? inputError : inputNormal}`}
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

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300" htmlFor="confirmPassword">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  maxLength={128}
                  value={confirmPassword}
                  onChange={(event) => { setConfirmPassword(event.target.value); setConfirmPasswordError(null); setFormError(null); }}
                  placeholder="••••••••"
                  className={`${inputBase} pl-10 pr-10 py-2.5 ${confirmPasswordError ? inputError : inputNormal}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPasswordError && <p className="text-sm text-red-500 font-semibold">{confirmPasswordError}</p>}
            </div>

            {/* Profile Picture */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300" htmlFor="profile-pic">
                Profile picture <span className="text-zinc-400 dark:text-zinc-600">(optional)</span>
              </label>
              <div className={`flex items-center gap-3 rounded-xl border px-3 py-2 bg-white dark:bg-zinc-900 transition duration-150 ${formError?.includes('Image') ? 'border-red-400' : 'border-zinc-200 dark:border-zinc-800'}`}>
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
                  className="w-full text-xs text-zinc-500 file:mr-3 file:rounded-xl file:border-0 file:bg-zinc-100 file:px-2.5 file:py-1.5 file:text-xs file:font-semibold file:text-zinc-700 hover:file:bg-zinc-200 dark:text-zinc-400 dark:file:bg-zinc-800 dark:file:text-zinc-200 dark:hover:file:bg-zinc-700 cursor-pointer"
                />
              </div>
            </div>

            {formError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400 font-semibold">
                {formError}
              </div>
            )}
            {error && !formError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400 font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-white px-4 py-2.5 text-xs font-bold text-white dark:text-zinc-900 transition-all duration-150 hover:bg-zinc-700 dark:hover:bg-zinc-100 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Creating account…' : 'Create account'} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-zinc-550 dark:text-zinc-400">
          Already have an account?{' '}
          <a href="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors">
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}
