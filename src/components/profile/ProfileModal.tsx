'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Shield, Loader2, Mail, Camera, FileCheck, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  
  // Profile info state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [gender, setGender] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');

  // Error States
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [mobileError, setMobileError] = useState<string | null>(null);
  const [genderError, setGenderError] = useState<string | null>(null);

  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Preset Avatar URLs for quick selection
  const avatarPresets = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', // Woman 1
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', // Man 1
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', // Woman 2
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', // Man 2
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', // Woman 3
  ];

  useEffect(() => {
    if (isOpen && user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setProfilePicture(user.profilePicture || '');
      setGender(user.gender || '');
      setCountryCode(user.countryCode || '+91');
      setMobileNumber(user.mobileNumber || '');
      
      setFirstNameError(null);
      setLastNameError(null);
      setMobileError(null);
      setGenderError(null);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFirstNameError(null);
    setLastNameError(null);
    setMobileError(null);
    setGenderError(null);

    let hasError = false;

    const nameRegex = /^[a-zA-Z][a-zA-Z.'-]*$/;

    if (!firstName.trim()) {
      setFirstNameError('First name is required.');
      hasError = true;
    } else if (firstName.trim().length < 2) {
      setFirstNameError('First name must be at least 2 characters.');
      hasError = true;
    } else if (!nameRegex.test(firstName)) {
      setFirstNameError("First name must start with a letter and contain only letters, dots, quotes, and hyphens.");
      hasError = true;
    }
    if (!lastName.trim()) {
      setLastNameError('Last name is required.');
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
      setGenderError('Gender selection is required.');
      hasError = true;
    }
    if (!mobileNumber.trim()) {
      setMobileError('Mobile number is required.');
      hasError = true;
    } else if (mobileNumber.length !== 10) {
      setMobileError('Mobile number must be exactly 10 digits.');
      hasError = true;
    } else if (mobileNumber.startsWith('0')) {
      setMobileError('Mobile number should never start with 0.');
      hasError = true;
    }

    if (hasError) return;

    setIsSavingProfile(true);
    try {
      await updateUser({
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        profilePicture,
        gender,
        countryCode,
        mobileNumber
      });
      toast.success('Profile updated successfully');
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File is too large. Max size is 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-250">
      <div 
        className="w-full max-w-xl bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 px-6 py-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-zinc-900 dark:text-white" />
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white font-outfit">My Profile</h2>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* User Details (Display Only) */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900/60">
            <img 
              src={profilePicture || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'} 
              alt={firstName}
              className="h-16 w-16 rounded-full object-cover ring-2 ring-zinc-200 dark:ring-zinc-800 shadow-sm"
            />
            <div className="text-center sm:text-left space-y-1">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">{user.name}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 justify-center sm:justify-start">
                <Mail className="h-3.5 w-3.5 text-zinc-400" /> {user.email}
              </p>
              {user.mobileNumber && (
                <p className="text-xs text-zinc-550 dark:text-zinc-400 flex items-center gap-1.5 justify-center sm:justify-start">
                  <Phone className="h-3.5 w-3.5 text-zinc-400" /> {user.countryCode} {user.mobileNumber}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-1.5 justify-center sm:justify-start">
                <span className="rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100/50 dark:border-blue-900/50 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                  {user.designation || 'Employee'}
                </span>
                <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 px-2 py-0.5 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-900 pb-2">
              <Shield className="h-4 w-4 text-zinc-500" /> Basic Details
            </h4>
            
            {/* First Name & Last Name inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="profile-firstname" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">First Name</label>
                <input
                  id="profile-firstname"
                  type="text"
                  value={firstName}
                  onChange={(e) => handleFirstNameChange(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-zinc-50 outline-none transition focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${firstNameError ? 'border-red-400' : 'border-zinc-200 dark:border-zinc-800'}`}
                  placeholder="First name"
                  required
                />
                {firstNameError && <p className="text-sm text-red-500 font-semibold">{firstNameError}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="profile-lastname" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Last Name</label>
                <input
                  id="profile-lastname"
                  type="text"
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
                  className={`w-full px-3.5 py-2 rounded-xl border bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-zinc-50 outline-none transition focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${lastNameError ? 'border-red-400' : 'border-zinc-200 dark:border-zinc-800'}`}
                  placeholder="Last name"
                  required
                />
                {lastNameError && <p className="text-sm text-red-500 font-semibold">{lastNameError}</p>}
              </div>
            </div>

            {/* Gender Selection Dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="profile-gender" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Gender</label>
              <select
                id="profile-gender"
                value={gender}
                onChange={(e) => { setGender(e.target.value); setGenderError(null); }}
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {genderError && <p className="text-sm text-red-500 font-semibold">{genderError}</p>}
            </div>

            {/* Mobile number & Country dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="profile-mobile" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Mobile Number</label>
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
                    id="profile-mobile"
                    type="text"
                    inputMode="numeric"
                    value={mobileNumber}
                    onChange={(e) => handleMobileChange(e.target.value)}
                    placeholder="10-digit number"
                    className={`w-full pl-10 pr-3.5 py-2 rounded-xl border bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-zinc-50 outline-none transition focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${mobileError ? 'border-red-400' : 'border-zinc-200 dark:border-zinc-800'}`}
                  />
                </div>
              </div>
              {mobileError && <p className="text-sm text-red-500 font-semibold">{mobileError}</p>}
            </div>

            {/* Photo Input (System file selector) */}
            <div className="space-y-1.5">
              <label htmlFor="profile-photo" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Profile Photo</label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="relative group overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 w-24 h-24 flex items-center justify-center shrink-0">
                  {profilePicture ? (
                    <img src={profilePicture} alt="Selected profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-8 w-8 text-zinc-400" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    id="profile-photo-file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-xs text-zinc-500
                      file:mr-4 file:py-1.5 file:px-3
                      file:rounded-xl file:border-0
                      file:text-xs file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100
                      dark:file:bg-blue-950/30 dark:file:text-blue-400
                      cursor-pointer"
                  />
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Choose a photo from your device. Max size 2MB.</p>
                </div>
              </div>
            </div>

            {/* Quick Avatar Presets Selector */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5"><Camera className="h-3.5 w-3.5" /> Quick Preset Selection</span>
              <div className="flex gap-2.5 pt-1">
                {avatarPresets.map((preset, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setProfilePicture(preset)}
                    className={`relative h-10 w-10 rounded-full overflow-hidden border-2 transition hover:scale-105 ${profilePicture === preset ? 'border-blue-600 scale-105' : 'border-zinc-200 dark:border-zinc-800'}`}
                  >
                    <img src={preset} alt="preset" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Save Profile Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition shadow-sm cursor-pointer"
              >
                {isSavingProfile ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileCheck className="h-3.5 w-3.5" />}
                Save Details
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
