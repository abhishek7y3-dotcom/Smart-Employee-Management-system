'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import { Key, Eye, EyeOff, Loader2, Trash2, ShieldAlert, AlertTriangle, Send, CheckCircle2, Clock, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Country, State, City } from 'country-state-city';
import Select from 'react-select';
import { sanitizePhoneNumber, validatePhoneNumber } from '../../utils/phoneValidation';

const reactSelectClassNames = {
  control: () => '!bg-transparent !border-zinc-200 dark:!border-zinc-800 !rounded-xl !shadow-none !py-0.5',
  menu: () => '!bg-white dark:!bg-zinc-900 !border !border-zinc-200 dark:!border-zinc-800 !rounded-xl !mt-1',
  option: (state: any) => `!cursor-pointer !text-zinc-900 dark:!text-zinc-100 hover:!bg-zinc-100 dark:hover:!bg-zinc-800 ${state.isSelected ? '!bg-blue-50 dark:!bg-blue-900/30' : '!bg-transparent'}`,
  singleValue: () => '!text-zinc-950 dark:!text-zinc-50',
  input: () => '!text-zinc-950 dark:!text-zinc-50',
  placeholder: () => '!text-zinc-500',
  menuList: () => '!p-1',
};

export default function SettingsPage() {
  const { user, forgotPassword, resetPassword, deleteAccount, verifyResetOtp, updateUser } = useAuth();
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

  // Country, State & District handling
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [selectedCountryName, setSelectedCountryName] = useState(user?.country || '');
  const [selectedStateCode, setSelectedStateCode] = useState('');
  const [selectedStateName, setSelectedStateName] = useState(user?.state || '');
  const [selectedDistrictName, setSelectedDistrictName] = useState(user?.district || '');

  // Documents handling
  const [existingDocuments, setExistingDocuments] = useState<string[]>(user?.documents || []);
  const [newDocumentsBase64, setNewDocumentsBase64] = useState<string[]>([]);
  const [isConvertingFiles, setIsConvertingFiles] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // Controlled Phone states for typing restrictions
  const [mobilePhoneValue, setMobilePhoneValue] = useState('');
  const [alternatePhoneValue, setAlternatePhoneValue] = useState('');

  // Initialize selected country and state code
  useEffect(() => {
    let currentCountryCode = '';
    if (user?.country) {
      const countries = Country.getAllCountries();
      const foundCountry = countries.find(c => c.name === user.country);
      if (foundCountry) {
        currentCountryCode = foundCountry.isoCode;
        setSelectedCountryCode(foundCountry.isoCode);
        setSelectedCountryName(foundCountry.name);
      }
    }
    
    if (user?.state && currentCountryCode) {
      const states = State.getStatesOfCountry(currentCountryCode);
      const foundState = states.find(s => s.name === user.state);
      if (foundState) {
        setSelectedStateCode(foundState.isoCode);
        setSelectedStateName(foundState.name);
      }
    }
    
    if (user?.district) {
      setSelectedDistrictName(user.district);
    }
    
    if (user?.mobileNumber) setMobilePhoneValue(user.mobileNumber);
    if (user?.alternateNumber) setAlternatePhoneValue(user.alternateNumber);
  }, [user]);

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
          
          {/* Profile Edit Tab */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/60 space-y-5">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
              <UserIcon className="h-4.5 w-4.5 text-blue-500" />
              Profile Details
            </h2>
            <div className="w-full space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="settings-first-name" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">First Name</label>
                  <input
                    id="settings-first-name"
                    type="text"
                    maxLength={50}
                    defaultValue={user?.firstName}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^A-Za-z]/g, '');
                      if (val.length > 0) {
                        val = val.charAt(0).toUpperCase() + val.slice(1);
                      }
                      e.target.value = val;
                      if (typeof window !== 'undefined') {
                        (window as any)._tempEditFirstName = val;
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-zinc-50 outline-none transition focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="settings-last-name" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Last Name</label>
                  <input
                    id="settings-last-name"
                    type="text"
                    maxLength={50}
                    defaultValue={user?.lastName}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^A-Za-z ]/g, '');
                      val = val.replace(/^\s+/, ''); // Remove leading spaces
                      val = val.replace(/\s{2,}/g, ' '); // Allow max one space consecutively
                      
                      if (val.length > 0) {
                        val = val.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                      }
                      e.target.value = val;
                      if (typeof window !== 'undefined') {
                        (window as any)._tempEditLastName = val;
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-zinc-50 outline-none transition focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="settings-country" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Country</label>
                  <Select
                    instanceId="country-select"
                    options={Country.getAllCountries().map(c => ({
                      value: c.name,
                      label: (
                        <div className="flex items-center gap-2">
                          <img src={`https://flagcdn.com/w20/${c.isoCode.toLowerCase()}.png`} alt={c.name} className="w-5" />
                          <span>{c.name}</span>
                        </div>
                      ),
                      country: c
                    }))}
                    value={
                      selectedCountryCode ? {
                        value: selectedCountryName,
                        label: (
                          <div className="flex items-center gap-2">
                            <img src={`https://flagcdn.com/w20/${selectedCountryCode.toLowerCase()}.png`} alt={selectedCountryName} className="w-5" />
                            <span>{selectedCountryName}</span>
                          </div>
                        )
                      } : null
                    }
                    onChange={(selectedOption: any) => {
                      if (!selectedOption) return;
                      const newCode = selectedOption.country.isoCode;
                      const newName = selectedOption.country.name;
                      setSelectedCountryCode(newCode);
                      setSelectedCountryName(newName);
                      
                      // Reset state and district when country changes
                      setSelectedStateCode('');
                      setSelectedStateName('');
                      setSelectedDistrictName('');
                      
                      if (typeof window !== 'undefined') {
                        (window as any)._tempEditCountry = newName;
                        (window as any)._tempEditState = '';
                        (window as any)._tempEditDistrict = '';
                      }
                    }}
                    placeholder="Select Country"
                    classNames={reactSelectClassNames}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="settings-email" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Email Address (Read-only)</label>
                  <input
                    id="settings-email"
                    type="email"
                    defaultValue={user?.email}
                    readOnly
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-sm text-zinc-500 dark:text-zinc-400 outline-none cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="settings-mobile" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Mobile Number</label>
                  <PhoneInput
                    country={selectedCountryCode ? selectedCountryCode.toLowerCase() : 'in'}
                    value={mobilePhoneValue}
                    onChange={(phone, data: any) => {
                      if (data?.dialCode) {
                        const localPart = phone.slice(data.dialCode.length);
                        
                        // Dynamic country-based length restriction
                        if (data.format) {
                          const maxLen = (data.format.match(/\./g) || []).length;
                          if (phone.length > maxLen) {
                            setMobilePhoneValue('');
                            setTimeout(() => setMobilePhoneValue(mobilePhoneValue), 0);
                            return;
                          }
                        } else {
                          if (localPart.length > 15) {
                            setMobilePhoneValue('');
                            setTimeout(() => setMobilePhoneValue(mobilePhoneValue), 0);
                            return;
                          }
                        }

                        // Specific valid starting digits for India
                        if (data.dialCode === '91') {
                          if (/^[0-5]/.test(localPart)) {
                            setMobilePhoneValue('');
                            setTimeout(() => setMobilePhoneValue(data.dialCode), 0);
                            return;
                          }
                        }
                      }
                      setMobilePhoneValue(phone);
                      if (typeof window !== 'undefined') {
                        (window as any)._tempEditMobile = phone;
                      }
                    }}
                    inputStyle={{ width: '100%', height: '42px', borderRadius: '0.75rem', background: 'transparent' }}
                    inputClass="!border-zinc-200 dark:!border-zinc-800 !text-zinc-950 dark:!text-zinc-50"
                    buttonClass="!bg-transparent !border-zinc-200 dark:!border-zinc-800 hover:!bg-zinc-100 dark:hover:!bg-zinc-800"
                    dropdownClass="!bg-white dark:!bg-zinc-900 !text-zinc-950 dark:!text-zinc-50 !border-zinc-200 dark:!border-zinc-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="settings-gender" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Gender</label>
                  <select
                    id="settings-gender"
                    defaultValue={user?.gender || ''}
                    onChange={(e) => {
                      if (typeof window !== 'undefined') {
                        (window as any)._tempEditGender = e.target.value;
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-zinc-50 outline-none transition focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="settings-qualification" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Qualification</label>
                  <input
                    id="settings-qualification"
                    type="text"
                    defaultValue={user?.qualification}
                    onChange={(e) => {
                      if (typeof window !== 'undefined') {
                        (window as any)._tempEditQualification = e.target.value;
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-zinc-50 outline-none transition focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="settings-role" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Role (Read-only)</label>
                  <input
                    id="settings-role"
                    type="text"
                    defaultValue={user?.role}
                    readOnly
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-sm text-zinc-500 dark:text-zinc-400 outline-none capitalize cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="settings-permanent-address" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Permanent Address</label>
                  <input
                    id="settings-permanent-address"
                    type="text"
                    defaultValue={user?.permanentAddress}
                    onChange={(e) => {
                      if (typeof window !== 'undefined') {
                        (window as any)._tempEditPermanentAddress = e.target.value;
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-zinc-50 outline-none transition focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="settings-current-address" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Current Address</label>
                  <input
                    id="settings-current-address"
                    type="text"
                    defaultValue={user?.currentAddress}
                    onChange={(e) => {
                      if (typeof window !== 'undefined') {
                        (window as any)._tempEditCurrentAddress = e.target.value;
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-zinc-50 outline-none transition focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="settings-alternate-number" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Alternate Number</label>
                  <PhoneInput
                    country={selectedCountryCode ? selectedCountryCode.toLowerCase() : 'in'}
                    value={alternatePhoneValue}
                    onChange={(phone, data: any) => {
                      if (data?.dialCode) {
                        const localPart = phone.slice(data.dialCode.length);
                        
                        // Dynamic country-based length restriction
                        if (data.format) {
                          const maxLen = (data.format.match(/\./g) || []).length;
                          if (phone.length > maxLen) {
                            setAlternatePhoneValue('');
                            setTimeout(() => setAlternatePhoneValue(alternatePhoneValue), 0);
                            return;
                          }
                        } else {
                          if (localPart.length > 15) {
                            setAlternatePhoneValue('');
                            setTimeout(() => setAlternatePhoneValue(alternatePhoneValue), 0);
                            return;
                          }
                        }

                        // Specific valid starting digits for India
                        if (data.dialCode === '91') {
                          if (/^[0-5]/.test(localPart)) {
                            setAlternatePhoneValue('');
                            setTimeout(() => setAlternatePhoneValue(data.dialCode), 0);
                            return;
                          }
                        }
                      }
                      setAlternatePhoneValue(phone);
                      if (typeof window !== 'undefined') {
                        (window as any)._tempEditAlternateNumber = phone;
                      }
                    }}
                    inputStyle={{ width: '100%', height: '42px', borderRadius: '0.75rem', background: 'transparent' }}
                    inputClass="!border-zinc-200 dark:!border-zinc-800 !text-zinc-950 dark:!text-zinc-50"
                    buttonClass="!bg-transparent !border-zinc-200 dark:!border-zinc-800 hover:!bg-zinc-100 dark:hover:!bg-zinc-800"
                    dropdownClass="!bg-white dark:!bg-zinc-900 !text-zinc-950 dark:!text-zinc-50 !border-zinc-200 dark:!border-zinc-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="settings-state" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">State</label>
                  <Select
                    instanceId="state-select"
                    isDisabled={!selectedCountryCode}
                    options={selectedCountryCode ? State.getStatesOfCountry(selectedCountryCode).map(s => ({
                      value: s.name,
                      label: s.name,
                      state: s
                    })) : []}
                    value={
                      selectedStateCode ? {
                        value: selectedStateName,
                        label: selectedStateName
                      } : null
                    }
                    onChange={(selectedOption: any) => {
                      if (!selectedOption) return;
                      const newCode = selectedOption.state.isoCode;
                      const newName = selectedOption.state.name;
                      setSelectedStateCode(newCode);
                      setSelectedStateName(newName);
                      if (typeof window !== 'undefined') {
                        (window as any)._tempEditState = newName;
                        (window as any)._tempEditDistrict = ''; // Reset district on state change
                      }
                      setSelectedDistrictName('');
                    }}
                    placeholder="Select State"
                    classNames={reactSelectClassNames}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="settings-district" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">District / City</label>
                  <Select
                    instanceId="district-select"
                    isDisabled={!selectedStateCode}
                    options={selectedStateCode && selectedCountryCode ? City.getCitiesOfState(selectedCountryCode, selectedStateCode).map(c => ({
                      value: c.name,
                      label: c.name
                    })) : []}
                    value={
                      selectedDistrictName ? {
                        value: selectedDistrictName,
                        label: selectedDistrictName
                      } : null
                    }
                    onChange={(selectedOption: any) => {
                      if (!selectedOption) return;
                      setSelectedDistrictName(selectedOption.value);
                      if (typeof window !== 'undefined') {
                        (window as any)._tempEditDistrict = selectedOption.value;
                      }
                    }}
                    placeholder="Select District"
                    classNames={reactSelectClassNames}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="settings-documents" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Documents</label>
                  
                  {existingDocuments.length > 0 && (
                    <div className="mb-2 space-y-1">
                      <p className="text-xs text-zinc-500">Currently uploaded documents:</p>
                      <div className="flex flex-wrap gap-2">
                        {existingDocuments.map((doc, idx) => (
                          <div key={idx} className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-xs">
                            <a href={doc} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate max-w-[150px]">
                              Document {idx + 1}
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                setExistingDocuments(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="text-red-500 hover:text-red-700 ml-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {newDocumentsBase64.length > 0 && (
                    <div className="mb-2 space-y-1">
                      <p className="text-xs text-zinc-500">Files ready to upload:</p>
                      <div className="flex flex-wrap gap-2">
                        {newDocumentsBase64.map((_, idx) => (
                          <div key={idx} className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded text-xs text-blue-700 dark:text-blue-300">
                            <span>New File {idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setNewDocumentsBase64(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="text-red-500 hover:text-red-700 ml-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <input
                    id="settings-documents"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    disabled={isConvertingFiles}
                    className="block w-full text-sm text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 dark:file:bg-zinc-800 dark:file:text-zinc-300 dark:hover:file:bg-zinc-700 outline-none cursor-pointer"
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      
                      // Fake file validation
                      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg'];
                      const validFiles = Array.from(files).filter(file => allowedTypes.includes(file.type));
                      
                      if (validFiles.length !== files.length) {
                        toast.error('Invalid or fake file detected. Only PDF, DOCX, JPG, and PNG are allowed.');
                        e.target.value = '';
                        return;
                      }

                      setIsConvertingFiles(true);
                      
                      const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = error => reject(error);
                      });

                      try {
                        const base64Files = await Promise.all(Array.from(files).map(toBase64));
                        setNewDocumentsBase64(prev => [...prev, ...base64Files]);
                        // Reset input so same file can be selected again if removed
                        e.target.value = '';
                      } catch (error) {
                        toast.error('Failed to process one or more files.');
                      } finally {
                        setIsConvertingFiles(false);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-zinc-50 outline-none transition focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {isConvertingFiles && <span className="text-xs text-zinc-500 flex items-center gap-1 mt-1"><Loader2 className="w-3 h-3 animate-spin" /> Processing files...</span>}
                </div>
                <div className="space-y-1.5 sm:col-span-2 flex items-center gap-2 mt-2">
                  <input
                    id="settings-terms"
                    type="checkbox"
                    defaultChecked={user?.termsAndConditions}
                    onChange={(e) => {
                      if (typeof window !== 'undefined') {
                        (window as any)._tempEditTerms = e.target.checked;
                      }
                    }}
                    className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="settings-terms" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    I agree to the <button type="button" onClick={() => setIsTermsModalOpen(true)} className="text-blue-600 hover:underline">Terms and Conditions</button>
                  </label>
                </div>
              </div>
              <button
                type="button"
                onClick={async (e) => {
                  const btn = e.currentTarget;
                  const prevText = btn.innerHTML;
                  btn.innerHTML = 'Saving...';
                  btn.disabled = true;
                  try {
                    const updates: any = {};
                    if ((window as any)._tempEditFirstName !== undefined) updates.firstName = (window as any)._tempEditFirstName;
                    if ((window as any)._tempEditLastName !== undefined) updates.lastName = (window as any)._tempEditLastName;
                    
                    // Also derive 'name' if either firstName or lastName is updated
                    if ((window as any)._tempEditFirstName !== undefined || (window as any)._tempEditLastName !== undefined) {
                      const fName = (window as any)._tempEditFirstName !== undefined ? (window as any)._tempEditFirstName : (user?.firstName || '');
                      const lName = (window as any)._tempEditLastName !== undefined ? (window as any)._tempEditLastName : (user?.lastName || '');
                      updates.name = `${fName} ${lName}`.trim();
                    }
                    
                    if ((window as any)._tempEditCountry !== undefined) updates.country = (window as any)._tempEditCountry;
                    if ((window as any)._tempEditMobile !== undefined) {
                      const sanitized = sanitizePhoneNumber((window as any)._tempEditMobile);
                      if (sanitized) {
                        const validation = validatePhoneNumber(sanitized);
                        if (!validation.isValid) {
                          toast.error(`Mobile Number: ${validation.error}`);
                          btn.innerHTML = prevText;
                          btn.disabled = false;
                          return;
                        }
                      }
                      updates.mobileNumber = sanitized;
                    }
                    if ((window as any)._tempEditGender) updates.gender = (window as any)._tempEditGender;
                    if ((window as any)._tempEditQualification) updates.qualification = (window as any)._tempEditQualification;
                    if ((window as any)._tempEditPermanentAddress !== undefined) updates.permanentAddress = (window as any)._tempEditPermanentAddress;
                    if ((window as any)._tempEditCurrentAddress !== undefined) updates.currentAddress = (window as any)._tempEditCurrentAddress;
                    
                    if ((window as any)._tempEditAlternateNumber !== undefined) {
                      const sanitizedAlt = sanitizePhoneNumber((window as any)._tempEditAlternateNumber);
                      if (sanitizedAlt) {
                        const validationAlt = validatePhoneNumber(sanitizedAlt);
                        if (!validationAlt.isValid) {
                          toast.error(`Alternate Number: ${validationAlt.error}`);
                          btn.innerHTML = prevText;
                          btn.disabled = false;
                          return;
                        }
                      }
                      updates.alternateNumber = sanitizedAlt;
                    }
                    
                    if ((window as any)._tempEditState !== undefined) updates.state = (window as any)._tempEditState;
                    if ((window as any)._tempEditDistrict !== undefined) updates.district = (window as any)._tempEditDistrict;
                    
                    // Combine existing documents and newly uploaded base64 documents
                    updates.documents = [...existingDocuments, ...newDocumentsBase64];

                    if ((window as any)._tempEditTerms !== undefined) updates.termsAndConditions = (window as any)._tempEditTerms;
                    
                    if (Object.keys(updates).length > 0) {
                      await updateUser(updates);
                      toast.success('Profile updated successfully!');
                    }
                  } catch (err: any) {
                    toast.error(err?.message || 'Failed to update profile');
                  } finally {
                    btn.innerHTML = prevText;
                    btn.disabled = false;
                  }
                }}
                className="flex items-center gap-1.5 py-2 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>

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

      {/* Terms and Conditions Modal */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Terms & Conditions (Registration & Profile Update)</h3>
              <button onClick={() => setIsTermsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                <Trash2 className="w-5 h-5 hidden" />
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
              <p>By registering an account or updating your profile in the Employee Management System (&quot;EMS&quot;), you agree to the following terms:</p>
              
              <div><strong className="text-zinc-900 dark:text-white">Accurate Information</strong><br/>You agree to provide accurate, complete, and up-to-date personal and professional information during registration and profile updates. Providing false or misleading information may result in account suspension or termination.</div>
              
              <div><strong className="text-zinc-900 dark:text-white">Account Responsibility</strong><br/>You are responsible for maintaining the confidentiality of your login credentials. You must not share your username, password, or verification codes with anyone. Any activity performed using your account is your responsibility.</div>
              
              <div><strong className="text-zinc-900 dark:text-white">Profile Updates</strong><br/>You may update your personal information whenever necessary. Certain fields, such as Employee ID, Company Email, Role, Department, or other official records, may only be modified by authorized administrators.</div>
              
              <div><strong className="text-zinc-900 dark:text-white">Data Privacy</strong><br/>Your personal information will be collected, stored, and processed only for employment-related purposes, including account management, communication, attendance, payroll, and other HR operations. Your information will be handled securely and in accordance with the organization&apos;s Privacy Policy.</div>
              
              <div><strong className="text-zinc-900 dark:text-white">Acceptable Use</strong><br/>You agree to use the system only for legitimate business purposes. You must not upload harmful, offensive, misleading, or illegal content, attempt unauthorized access, interfere with system security, or misuse the platform in any way.</div>
              
              <div><strong className="text-zinc-900 dark:text-white">Security Monitoring</strong><br/>For security, compliance, and audit purposes, the system may record login history, profile updates, password changes, and other account activities. These records may be reviewed by authorized personnel when necessary.</div>
              
              <div><strong className="text-zinc-900 dark:text-white">Account Suspension</strong><br/>The organization reserves the right to suspend, restrict, or terminate your account if you violate these Terms & Conditions, provide false information, misuse the system, or engage in unauthorized activities.</div>
              
              <div><strong className="text-zinc-900 dark:text-white">System Availability</strong><br/>While every effort is made to ensure uninterrupted access, the system may occasionally be unavailable due to maintenance, updates, or technical issues. The organization is not responsible for temporary service interruptions.</div>
              
              <div><strong className="text-zinc-900 dark:text-white">Changes to Terms</strong><br/>These Terms & Conditions may be updated from time to time. Continued use of the Employee Management System after any changes indicates your acceptance of the revised terms.</div>
            </div>
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
              <button 
                onClick={() => setIsTermsModalOpen(false)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
