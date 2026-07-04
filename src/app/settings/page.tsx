'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import { Key, Eye, EyeOff, Loader2, Trash2, ShieldAlert, AlertTriangle, Send, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, forgotPassword, resetPassword, deleteAccount, verifyResetOtp } = useAuth();
  const router = useRouter();

  // Change password states
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [savedOtp, setSavedOtp] = useState(''); 
  const [passwordTimer, setPasswordTimer] = useState(0); // 120s countdown

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Delete account states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteOtpSent, setIsDeleteOtpSent] = useState(false);
  const [isRequestingDeleteOtp, setIsRequestingDeleteOtp] = useState(false);
  const [deleteOtpDigits, setDeleteOtpDigits] = useState(['', '', '', '', '', '']);
  const [confirmText, setConfirmText] = useState('');
  const [isVerifyingDeleteOtp, setIsVerifyingDeleteOtp] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTimer, setDeleteTimer] = useState(0); // 120s countdown

  // ─── Countdown Timers ──────────────────────────────────────────────────────

  useEffect(() => {
    if (passwordTimer <= 0) return;
    const interval = setInterval(() => {
      setPasswordTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [passwordTimer]);

  useEffect(() => {
    if (deleteTimer <= 0) return;
    const interval = setInterval(() => {
      setDeleteTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [deleteTimer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ─── Box OTP Change Handlers ───────────────────────────────────────────────

  const handleBoxChange = (
    index: number,
    value: string,
    digits: string[],
    setDigits: React.Dispatch<React.SetStateAction<string[]>>,
    fieldPrefix: string
  ) => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) {
      const nextDigits = [...digits];
      nextDigits[index] = '';
      setDigits(nextDigits);
      return;
    }

    const nextDigits = [...digits];
    nextDigits[index] = numericValue.slice(-1);
    setDigits(nextDigits);

    // Auto-focus next input
    if (index < 5) {
      const nextInput = document.getElementById(`${fieldPrefix}-${index + 1}`);
      if (nextInput) (nextInput as HTMLInputElement).focus();
    }
  };

  const handleBoxKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
    digits: string[],
    fieldPrefix: string
  ) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      const prevInput = document.getElementById(`${fieldPrefix}-${index - 1}`);
      if (prevInput) {
        (prevInput as HTMLInputElement).focus();
      }
    }
  };

  // ─── Change Password Handlers ──────────────────────────────────────────────

  const handleRequestOtp = async () => {
    if (!user) return;
    setIsRequestingOtp(true);
    setPasswordError('');
    try {
      await forgotPassword({ email: user.email });
      setIsOtpSent(true);
      setOtpDigits(['', '', '', '', '', '']);
      setPasswordTimer(120); // 2-min countdown
      toast.success('Verification OTP code sent. Redirecting to reset page...');
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(user.email)}`);
      }, 1500);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send OTP code');
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!user) return;
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      setPasswordError('Please enter the 6-digit OTP code');
      return;
    }
    if (passwordTimer <= 0) {
      setPasswordError('Verification code has expired. Please request a new OTP.');
      return;
    }

    setIsVerifyingOtp(true);
    setPasswordError('');
    try {
      await verifyResetOtp(fullOtp);
      setSavedOtp(fullOtp);
      setIsOtpVerified(true);
      toast.success('OTP verified successfully! You can now update your password.');
    } catch (err: any) {
      toast.error(err?.message || 'Verification failed. Please check the OTP code.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!user) return;
    if (!newPassword) {
      setPasswordError('New password is required');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsResettingPassword(true);
    setPasswordError('');
    try {
      await resetPassword({
        email: user.email,
        otp: savedOtp,
        password: newPassword,
      });
      toast.success('Password changed successfully!');
      
      // Reset password change UI
      setNewPassword('');
      setConfirmPassword('');
      setOtpDigits(['', '', '', '', '', '']);
      setSavedOtp('');
      setIsOtpSent(false);
      setIsOtpVerified(false);
      setShowPasswordSection(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to change password. Please request a new OTP.');
      setIsOtpVerified(false);
      setOtpDigits(['', '', '', '', '', '']);
    } finally {
      setIsResettingPassword(false);
    }
  };

  // ─── Delete Account Handlers ───────────────────────────────────────────────

  const handleRequestDeleteOtp = async () => {
    if (!user) return;
    setIsRequestingDeleteOtp(true);
    try {
      await forgotPassword({ email: user.email });
      setIsDeleteOtpSent(true);
      setDeleteOtpDigits(['', '', '', '', '', '']);
      setDeleteTimer(120); // 2-min countdown
      toast.success('Verification OTP code sent to your email.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send OTP code');
    } finally {
      setIsRequestingDeleteOtp(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (confirmText.toLowerCase() !== 'delete') {
      toast.error('Please type "delete" to confirm');
      return;
    }
    const fullOtp = deleteOtpDigits.join('');
    if (fullOtp.length < 6) {
      toast.error('Please enter the 6-digit OTP code');
      return;
    }
    if (deleteTimer <= 0) {
      toast.error('Verification code has expired. Please request a new OTP.');
      return;
    }

    setIsVerifyingDeleteOtp(true);
    try {
      // First verify OTP
      await verifyResetOtp(fullOtp);
      
      // Then delete account
      setIsDeleting(true);
      await deleteAccount();
      toast.success('Account deleted successfully.');
    } catch (err: any) {
      toast.error(err?.message || 'Verification or deletion failed. Please check the OTP code.');
    } finally {
      setIsVerifyingDeleteOtp(false);
      setIsDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setIsDeleteOtpSent(false);
    setDeleteOtpDigits(['', '', '', '', '', '']);
    setConfirmText('');
    setDeleteTimer(0);
  };

  return (
    <ProtectedRoute>
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-zinc-950 dark:text-white md:text-2xl font-outfit">Account Settings</h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">Manage your system credentials and security options.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          
          {/* Security Tab */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/60 space-y-5">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
              <Key className="h-4.5 w-4.5 text-blue-500" />
              Security (Change Credentials)
            </h2>

            {passwordError && (
              <div className="p-3.5 text-xs text-red-650 bg-red-50 dark:bg-red-950/10 border border-red-150 dark:border-red-900/55 rounded-xl max-w-xl animate-in slide-in-from-top-1.5 duration-200">
                {passwordError}
              </div>
            )}

            <div className="max-w-xl space-y-4">
              {!showPasswordSection ? (
                <div className="space-y-3">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Update your account login password periodically to keep your workspace secure.</p>
                  <button
                    type="button"
                    onClick={() => setShowPasswordSection(true)}
                    className="flex items-center gap-1.5 py-2 px-5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                  >
                    🔑 Request Password Change
                  </button>
                </div>
              ) : !isOtpVerified ? (
                <div className="space-y-4 p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200/65 dark:border-zinc-800/65 animate-in fade-in duration-200">
                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    For security, we must verify your identity. Let us send a 6-digit verification code to your registered email: <span className="font-bold text-zinc-900 dark:text-white">{user?.email}</span>.
                  </p>

                  {!isOtpSent ? (
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={isRequestingOtp}
                      className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer"
                    >
                      {isRequestingOtp ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      Send Verification OTP
                    </button>
                  ) : (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      
                      {/* Box OTP & Expiry countdown section */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Verification OTP Code</label>
                          {passwordTimer > 0 ? (
                            <span className="text-xs text-blue-650 dark:text-blue-450 font-bold flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 animate-pulse" /> Expires in: {formatTimer(passwordTimer)}
                            </span>
                          ) : (
                            <span className="text-xs text-red-550 dark:text-red-450 font-bold">Code Expired!</span>
                          )}
                        </div>

                        {/* Separate OTP Digit Inputs */}
                        <div className="flex gap-2.5 justify-center py-2">
                          {otpDigits.map((digit, idx) => (
                            <input
                              key={idx}
                              id={`pass-otp-${idx}`}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              disabled={passwordTimer <= 0}
                              onChange={(e) => handleBoxChange(idx, e.target.value, otpDigits, setOtpDigits, 'pass-otp')}
                              onKeyDown={(e) => handleBoxKeyDown(idx, e, otpDigits, 'pass-otp')}
                              className="w-12 h-12 text-center text-xl font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:opacity-50 text-zinc-950 dark:text-zinc-50"
                            />
                          ))}
                        </div>
                        {passwordTimer <= 0 && (
                          <p className="text-[10px] text-red-550 dark:text-red-450 font-medium">OTP has expired. Please click "Back" and request a new verification code.</p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsOtpSent(false);
                            setOtpDigits(['', '', '', '', '', '']);
                            setPasswordTimer(0);
                          }}
                          className="flex-1 py-2 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-650 dark:text-zinc-400 hover:bg-zinc-150 dark:hover:bg-zinc-900 transition cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={isVerifyingOtp || otpDigits.some(d => !d) || passwordTimer <= 0}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer"
                        >
                          {isVerifyingOtp ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                          Verify OTP Code
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Final Step: Password Change inputs
                <div className="space-y-4 p-4 rounded-xl bg-blue-50/20 dark:bg-blue-950/10 border border-blue-100/20 dark:border-blue-900/20 animate-in zoom-in-95 duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="settings-password" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">New Password</label>
                      <div className="relative">
                        <input
                          id="settings-password"
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-zinc-50 outline-none transition focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          placeholder="At least 8 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 cursor-pointer"
                        >
                          {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="settings-confirm-password" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Confirm Password</label>
                      <input
                        id="settings-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-zinc-50 outline-none transition focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="Repeat password"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsOtpVerified(false)}
                      className="py-2 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdatePassword}
                      disabled={isResettingPassword || !newPassword || !confirmPassword}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer"
                    >
                      {isResettingPassword && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Save New Password
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-2xl border border-red-200/60 bg-red-50/20 p-6 shadow-sm dark:border-red-950/5 space-y-5">
            <h2 className="text-sm font-bold text-red-700 dark:text-red-400 flex items-center gap-2 border-b border-red-100/40 dark:border-red-950/20 pb-3">
              <ShieldAlert className="h-4.5 w-4.5" />
              Profile Deletion
            </h2>

            <div className="space-y-4">
              <div className="max-w-xl text-xs text-red-650/80 dark:text-red-400/80 leading-relaxed">
                Deleting your account is permanent. This will erase all your personal data, logs, task assignations, and profile records from the database. You will not be able to log back in.
              </div>

              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-1.5 py-2 px-5 rounded-xl border border-red-200/80 bg-white hover:bg-red-50 text-xs font-bold text-red-600 dark:bg-zinc-950/60 dark:border-red-950/40 dark:text-red-400 dark:hover:bg-red-950/20 transition cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete My Profile permanently
              </button>
            </div>
          </div>

        </div>

        {/* Delete Account Confirmation Modal (OTP & Timer) */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-start gap-3 text-red-600">
                <div className="bg-red-100 dark:bg-red-950/50 p-2 rounded-xl shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">Delete Profile permanently?</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-normal">
                    This action is irreversible. For security, we require OTP verification to delete your account.
                  </p>
                </div>
              </div>

              {!isDeleteOtpSent ? (
                <div className="space-y-4 animate-in fade-in">
                  <p className="text-xs text-zinc-650 dark:text-zinc-450 leading-normal">
                    We will send a 6-digit OTP verification code to your profile email <span className="font-bold text-zinc-900 dark:text-zinc-200">{user?.email}</span>.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={closeDeleteModal}
                      className="flex-1 py-2 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestDeleteOtp}
                      disabled={isRequestingDeleteOtp}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer"
                    >
                      {isRequestingDeleteOtp && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Send Deletion OTP
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-red-700 dark:text-red-400">Verification OTP Code</label>
                      {deleteTimer > 0 ? (
                        <span className="text-xs text-red-650 dark:text-red-450 font-bold flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 animate-pulse" /> Expires in: {formatTimer(deleteTimer)}
                        </span>
                      ) : (
                        <span className="text-xs text-red-550 dark:text-red-450 font-bold">Code Expired!</span>
                      )}
                    </div>

                    {/* Separate OTP Digit Inputs for delete */}
                    <div className="flex gap-2.5 justify-center py-2">
                      {deleteOtpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`del-otp-${idx}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          disabled={deleteTimer <= 0}
                          onChange={(e) => handleBoxChange(idx, e.target.value, deleteOtpDigits, setDeleteOtpDigits, 'del-otp')}
                          onKeyDown={(e) => handleBoxKeyDown(idx, e, deleteOtpDigits, 'del-otp')}
                          className="w-12 h-12 text-center text-xl font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 disabled:opacity-50 text-zinc-950 dark:text-zinc-50"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="delete-confirm-text" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      To proceed, type <span className="font-bold text-zinc-900 dark:text-white font-mono">delete</span> below:
                    </label>
                    <input
                      id="delete-confirm-text"
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-zinc-50 font-mono outline-none transition focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      placeholder="delete"
                    />
                  </div>

                  {deleteTimer <= 0 && (
                    <p className="text-[10px] text-red-550 dark:text-red-450 font-medium">OTP has expired. Please cancel and request a new code.</p>
                  )}

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={closeDeleteModal}
                      className="flex-1 py-2 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={isVerifyingDeleteOtp || isDeleting || confirmText.toLowerCase() !== 'delete' || deleteOtpDigits.some(d => !d) || deleteTimer <= 0}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer"
                    >
                      {(isVerifyingDeleteOtp || isDeleting) ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Delete Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}
