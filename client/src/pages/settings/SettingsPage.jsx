import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Shield,
  Bell,
  Sliders,
  Globe,
  Calendar,
  IndianRupee,
  Eye,
  EyeOff,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Camera,
  Save,
  Check,
  X,
  Smartphone,
  MapPin,
  Briefcase,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import userService from '../../services/userService';
import { applyTheme } from '../../utils/theme';

export const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const { currency: globalCurrency, setCurrency: setGlobalCurrency, rateDate } = useCurrency();
  const navigate = useNavigate();

  // Active Tab
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'notifications', 'security', 'preferences', 'account'

  // Loading & Feedback states
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // ─── 1. PROFILE STATE ───
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    headline: '',
    bio: '',
    phone: '',
    location: '',
    avatar_url: '',
    role: 'founder',
    email_verified: false,
    created_at: null,
  });

  // ─── 2. NOTIFICATIONS & PREFERENCES STATE ───
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    analysis_completed: true,
    investor_activity: true,
    pitch_evaluated: true,
    monthly_summary: true,
    currency: 'INR',
    currency_symbol: '₹',
    number_format: 'indian',
    date_format: 'DD/MM/YYYY',
    theme: 'dark',
  });

  // ─── 3. PASSWORD STATE ───
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ─── 4. ACCOUNT DELETION MODAL STATE ───
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState(null);

  // Auto-dismiss alert banners after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Load User Profile and Preferences on Mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const data = await userService.getProfile();
        if (data.success && data.user) {
          setProfile({
            full_name: data.user.full_name || '',
            email: data.user.email || '',
            headline: data.user.headline || '',
            bio: data.user.bio || '',
            phone: data.user.phone || '',
            location: data.user.location || '',
            avatar_url: data.user.avatar_url || '',
            role: data.user.role || 'founder',
            email_verified: !!data.user.email_verified,
            created_at: data.user.created_at || null,
          });
        }
        if (data.preferences) {
          setPreferences((prev) => ({
            ...prev,
            ...data.preferences,
          }));
          if (data.preferences.theme) {
            applyTheme(data.preferences.theme);
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        setErrorMessage('Failed to load your account settings. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // ─── PROFILE HANDLERS ───
  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (PNG, JPG, or WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Image file is too large. Maximum size is 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Url = uploadEvent.target.result;
      setProfile((prev) => ({ ...prev, avatar_url: base64Url }));
      setSuccessMessage('Profile photo selected. Click "Save Profile Changes" to save.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await userService.updateProfile({
        full_name: profile.full_name,
        headline: profile.headline,
        bio: profile.bio,
        phone: profile.phone,
        location: profile.location,
        avatar_url: profile.avatar_url,
      });

      if (res.success && res.user) {
        updateUser(res.user);
        setSuccessMessage('Founder profile updated successfully!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile. Please check your inputs.';
      setErrorMessage(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  // ─── NOTIFICATION & PREFERENCE HANDLERS ───
  const handleTogglePreference = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSavePreferences = async (e, sectionName = 'Preferences') => {
    if (e) e.preventDefault();
    setSavingPreferences(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await userService.updatePreferences(preferences);
      if (res.success && res.preferences) {
        setPreferences((prev) => ({ ...prev, ...res.preferences }));
        if (res.preferences.theme) {
          applyTheme(res.preferences.theme);
        }
        setSuccessMessage(`${sectionName} saved successfully!`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || `Failed to save ${sectionName.toLowerCase()}.`;
      setErrorMessage(msg);
    } finally {
      setSavingPreferences(false);
    }
  };

  // ─── PASSWORD HANDLERS ───
  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-700' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
      case 2:
        return { score, label: 'Weak', color: 'bg-rose-500' };
      case 3:
      case 4:
        return { score, label: 'Good', color: 'bg-amber-500' };
      case 5:
        return { score, label: 'Strong', color: 'bg-emerald-500' };
      default:
        return { score: 0, label: 'Weak', color: 'bg-rose-500' };
    }
  };

  const passwordStrength = calculatePasswordStrength(passwordForm.new_password);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setErrorMessage('New password and confirmation password do not match.');
      setSavingPassword(false);
      return;
    }

    try {
      const res = await userService.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        confirm_password: passwordForm.confirm_password,
      });

      if (res.success) {
        setSuccessMessage('Password changed successfully. Your account is secured.');
        setPasswordForm({
          current_password: '',
          new_password: '',
          confirm_password: '',
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password. Please verify your current password.';
      setErrorMessage(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  // ─── ACCOUNT DELETION HANDLER ───
  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE') {
      setDeleteError('Please type exact confirmation text: DELETE');
      return;
    }
    if (!deletePassword) {
      setDeleteError('Please enter your account password to confirm deletion.');
      return;
    }

    setDeletingAccount(true);
    setDeleteError(null);

    try {
      const res = await userService.deleteAccount({
        password: deletePassword,
        confirmation_text: deleteConfirmationText,
      });

      if (res.success) {
        logout();
        navigate('/', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Account deletion failed. Check your password and try again.';
      setDeleteError(msg);
    } finally {
      setDeletingAccount(false);
    }
  };

  // Helper for Date formatting
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (preferences.date_format === 'MM/DD/YYYY') {
        return d.toLocaleDateString('en-US');
      } else if (preferences.date_format === 'YYYY-MM-DD') {
        return d.toISOString().split('T')[0];
      }
      // Default: DD/MM/YYYY
      return d.toLocaleDateString('en-GB');
    } catch {
      return String(dateStr);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading account settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* ─── PAGE HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <User className="w-6 h-6 text-indigo-400" />
            Account Settings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your founder profile, notification preferences, security credentials, and platform localization.
          </p>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          {profile.email_verified ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified Founder
            </span>
          ) : (
            <Link
              to="/verify-email"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Unverified Email • Verify Now
            </Link>
          )}
        </div>
      </div>

      {/* ─── FEEDBACK ALERTS ─── */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-400 hover:text-emerald-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── TAB NAVIGATION ─── */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 overflow-x-auto pb-1">
        {[
          { id: 'profile', label: 'Founder Profile', icon: User },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'security', label: 'Security & Password', icon: Shield },
          { id: 'preferences', label: 'App Preferences', icon: Sliders },
          { id: 'account', label: 'Account Management', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSuccessMessage(null);
                setErrorMessage(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap border-b-2 ${
                isActive
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: FOUNDER PROFILE ─── */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-400" />
                Personal & Founder Details
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                This information identifies you across your startup dossiers, pitch reviews, and AI investor discussions.
              </p>
            </div>

            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-4 rounded-xl bg-slate-950/60 border border-slate-800/70">
              <div className="relative group">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Founder Avatar"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-indigo-600/30 border-2 border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-2xl shadow-md">
                    {profile.full_name?.charAt(0)?.toUpperCase() || 'F'}
                  </div>
                )}
                <label
                  htmlFor="avatar-file-upload"
                  className="absolute bottom-1 right-1 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md transition-colors"
                  title="Upload New Avatar"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <input
                    id="avatar-file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-1.5 flex-1">
                <span className="text-sm font-semibold text-white block">Profile Picture</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upload a professional headshot or company avatar. Supports PNG, JPG, or WebP up to 2MB.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <label
                    htmlFor="avatar-file-upload"
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-colors"
                  >
                    Upload Photo
                  </label>
                  {profile.avatar_url && (
                    <button
                      type="button"
                      onClick={() => setProfile((prev) => ({ ...prev, avatar_url: '' }))}
                      className="text-xs text-slate-400 hover:text-red-400 transition-colors"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={profile.full_name}
                    onChange={(e) => handleProfileChange('full_name', e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Registered Email (Read-Only) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">Registered Email</label>
                  <span className="text-[10px] text-slate-500 italic flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Read-only security lock
                  </span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className="w-full bg-slate-950/60 border border-slate-800/60 rounded-xl pl-9 pr-3 py-2.5 text-slate-400 text-sm cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Email changes require security verification to preserve audit integrity.
                </p>
              </div>

              {/* Founder Headline */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Founder Title / Role
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={profile.headline}
                    onChange={(e) => handleProfileChange('headline', e.target.value)}
                    placeholder="e.g. Founder & CEO | AI Engineer"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Phone Number</label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Location / Ecosystem Hub
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => handleProfileChange('location', e.target.value)}
                    placeholder="e.g. Bengaluru, Karnataka, India"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Founder Bio */}
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Founder Bio & Venture Thesis
                </label>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                  placeholder="Share your domain background, technical experience, previous exits, or what drives your venture thesis..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Save Profile Button */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={savingProfile}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ─── TAB 2: NOTIFICATIONS ─── */}
      {activeTab === 'notifications' && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-400" />
              Notification Channels & Triggers
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select which milestone notifications and automated intelligence alerts you want to receive.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                id: 'email_notifications',
                title: 'Primary Email Notifications',
                desc: 'Receive transactional updates, security alerts, and critical account verification emails.',
                checked: preferences.email_notifications,
              },
              {
                id: 'analysis_completed',
                title: 'Startup Validation & Market Intelligence Alerts',
                desc: 'Alert me when Gemini completes TAM/SAM/SOM sizing, competitor matrices, or viability scorings.',
                checked: preferences.analysis_completed,
              },
              {
                id: 'investor_activity',
                title: 'AI Investor Room Evaluations',
                desc: 'Send a debrief whenever Marcus Vance, Elena Rostova, or virtual angels finalize a term sheet evaluation.',
                checked: preferences.investor_activity,
              },
              {
                id: 'pitch_evaluated',
                title: 'Pitch Evaluation & Script Rewrites',
                desc: 'Notify me when the 10-criteria pitch evaluation and improved deck narrative are synthesized.',
                checked: preferences.pitch_evaluated,
              },
              {
                id: 'monthly_summary',
                title: 'Monthly Venture Progress Summaries',
                desc: 'Receive periodic portfolio digests tracking Readiness Index shifts across all active startups.',
                checked: preferences.monthly_summary,
              },
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => handleTogglePreference(item.id)}
                className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer select-none"
              >
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-white block">{item.title}</span>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>

                <div
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors flex-shrink-0 ${
                    item.checked ? 'bg-indigo-600' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      item.checked ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={(e) => handleSavePreferences(e, 'Notification preferences')}
              disabled={savingPreferences}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20"
            >
              {savingPreferences ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Notification Preferences</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─── TAB 3: SECURITY & PASSWORD ─── */}
      {activeTab === 'security' && (
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                Change Password & Authentication Security
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Protect your account with a strong, distinct password encrypted with bcrypt hash standard.
              </p>
            </div>

            <div className="space-y-4 max-w-xl">
              {/* Current Password */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Current Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={passwordForm.current_password}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({ ...prev, current_password: e.target.value }))
                    }
                    placeholder="Enter your current password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  New Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={passwordForm.new_password}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({ ...prev, new_password: e.target.value }))
                    }
                    placeholder="Enter a strong new password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {passwordForm.new_password && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Password Strength:</span>
                      <span
                        className={`font-semibold ${
                          passwordStrength.label === 'Strong'
                            ? 'text-emerald-400'
                            : passwordStrength.label === 'Good'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Confirm New Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={passwordForm.confirm_password}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({ ...prev, confirm_password: e.target.value }))
                    }
                    placeholder="Re-type your new password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {passwordForm.confirm_password && (
                  <div className="mt-1 text-[11px]">
                    {passwordForm.new_password === passwordForm.confirm_password ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Passwords match
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1">
                        <X className="w-3.5 h-3.5" /> Passwords do not match
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Password Requirements Checklist */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5 text-slate-400">
                <span className="font-semibold text-slate-300 block">Security Requirements:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                  <span
                    className={
                      passwordForm.new_password.length >= 8 ? 'text-emerald-400' : 'text-slate-500'
                    }
                  >
                    • Minimum 8 characters
                  </span>
                  <span
                    className={
                      /[A-Z]/.test(passwordForm.new_password) ? 'text-emerald-400' : 'text-slate-500'
                    }
                  >
                    • At least one uppercase letter
                  </span>
                  <span
                    className={
                      /[a-z]/.test(passwordForm.new_password) ? 'text-emerald-400' : 'text-slate-500'
                    }
                  >
                    • At least one lowercase letter
                  </span>
                  <span
                    className={
                      /[0-9]/.test(passwordForm.new_password) ? 'text-emerald-400' : 'text-slate-500'
                    }
                  >
                    • At least one number
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={
                  savingPassword ||
                  !passwordForm.current_password ||
                  !passwordForm.new_password ||
                  passwordForm.new_password !== passwordForm.confirm_password
                }
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20"
              >
                {savingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ─── TAB 4: APP PREFERENCES ─── */}
      {activeTab === 'preferences' && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              Platform Localization & Formatting
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Configure your default currency, number formatting rules, date formats, and interface styles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Default Currency */}
            <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                <IndianRupee className="w-4 h-4" />
                <span>Default Financial Currency</span>
              </div>
              <p className="text-xs text-slate-400">
                Applied to unit economics, TAM/SAM/SOM market sizes, investor valuations, and financial models.
              </p>
              <select
                value={preferences.currency}
                onChange={(e) => {
                  const newCurr = e.target.value;
                  const sym =
                    newCurr === 'INR' ? '₹' : newCurr === 'USD' ? '$' : newCurr === 'EUR' ? '€' : '£';
                  setPreferences((prev) => ({
                    ...prev,
                    currency: newCurr,
                    currency_symbol: sym,
                  }));
                  setGlobalCurrency(newCurr);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="INR">Indian Rupee — INR (₹) [Recommended Default]</option>
                <option value="USD">US Dollar — USD ($)</option>
                <option value="EUR">Euro — EUR (€)</option>
                <option value="GBP">British Pound — GBP (£)</option>
              </select>
              <div className="text-[11px] text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>
                    {preferences.currency === 'INR'
                      ? 'INR (₹) is active as default across all simulator models, market research, and reports.'
                      : `${preferences.currency} is active. Monetary figures are dynamically converted using live exchange rates.`}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">Rates: {rateDate}</span>
              </div>
            </div>

            {/* 2. Number Formatting */}
            <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
                <Globe className="w-4 h-4" />
                <span>Number Formatting System</span>
              </div>
              <p className="text-xs text-slate-400">
                Determines thousands vs lakhs/crores grouping across analytics metrics and charts.
              </p>
              <select
                value={preferences.number_format}
                onChange={(e) => setPreferences((prev) => ({ ...prev, number_format: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="indian">Indian Grouping: ₹1,00,000 / ₹1.5 Cr / ₹50 L [Default]</option>
                <option value="international">International Grouping: ₹100,000 / ₹1.5M</option>
              </select>
              <div className="text-[11px] text-slate-400 italic">
                Preview: {preferences.number_format === 'indian' ? '₹15,00,000 (15 Lakhs)' : '₹1,500,000 (1.5M)'}
              </div>
            </div>

            {/* 3. Date Format */}
            <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                <Calendar className="w-4 h-4" />
                <span>Date Formatting</span>
              </div>
              <p className="text-xs text-slate-400">
                Display format for session timestamps, report export dates, and milestone logs.
              </p>
              <select
                value={preferences.date_format}
                onChange={(e) => setPreferences((prev) => ({ ...prev, date_format: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 13/11/2026) [Default]</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 11/13/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-11-13)</option>
              </select>
              <div className="text-[11px] text-slate-400 italic">
                Sample Output: {formatDate(new Date())}
              </div>
            </div>

            {/* 4. Theme Preference */}
            <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-violet-400 font-semibold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Interface Theme</span>
              </div>
              <p className="text-xs text-slate-400">
                VentureMind AI is designed with an immersive high-contrast dark navy workspace.
              </p>
              <select
                value={preferences.theme}
                onChange={(e) => {
                  const newTheme = e.target.value;
                  setPreferences((prev) => ({ ...prev, theme: newTheme }));
                  applyTheme(newTheme);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="light">VentureMind Light Theme</option>
                <option value="dark">VentureMind Dark Navy [Signature Theme]</option>
                <option value="system">Follow System Defaults</option>
              </select>
              <div className="text-[11px] text-slate-400 italic">
                Optimized for dark mode charts, Recharts graphs, and low eye-strain.
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={(e) => handleSavePreferences(e, 'Application preferences')}
              disabled={savingPreferences}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20"
            >
              {savingPreferences ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─── TAB 5: ACCOUNT MANAGEMENT ─── */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          {/* Account Overview Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-400" />
                Account Details & Identity
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Overview of your registered authentication status, roles, and creation timestamps.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Registered Account Email</span>
                <p className="text-sm font-semibold text-white truncate">{profile.email}</p>
                <span className="text-[10px] text-slate-500 block">Primary communication address</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Email Verification</span>
                <div className="flex items-center gap-2 pt-0.5">
                  {profile.email_verified ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified via Gmail OTP
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Pending Verification
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 block">Full platform capabilities unlocked</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Account Role & Tier</span>
                <p className="text-sm font-semibold text-white capitalize">{profile.role || 'Founder'}</p>
                <span className="text-[10px] text-slate-500 block">Unlimited simulations & reports</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Member Since</span>
                <p className="text-sm font-semibold text-white">{formatDate(profile.created_at)}</p>
                <span className="text-[10px] text-slate-500 block">Registration date</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Security Encryption</span>
                <p className="text-sm font-semibold text-emerald-400">Bcrypt + JWT 7d</p>
                <span className="text-[10px] text-slate-500 block">Salt rounds 12</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Database Node</span>
                <p className="text-sm font-semibold text-indigo-400">MySQL venturemind_db</p>
                <span className="text-[10px] text-slate-500 block">Foreign-key cascaded</span>
              </div>
            </div>
          </div>

          {/* Danger Zone: Account Deletion */}
          <div className="bg-rose-950/15 border border-rose-900/40 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="text-base font-bold">Danger Zone: Permanent Account Deletion</h4>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
              Permanently delete your VentureMind AI account. This action immediately deletes your user profile,
              all registered startup ventures, AI idea validations, deterministic financial forecasts, investor chat histories,
              pitch evaluations, and compiled PDF dossiers. This action is completely irreversible.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(true);
                  setDeleteConfirmationText('');
                  setDeletePassword('');
                  setDeleteError(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-lg shadow-rose-600/20"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Account Permanently...</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── DANGER MODAL: ACCOUNT DELETION ─── */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-900/60 rounded-2xl w-full max-w-md p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Account Deletion</h3>
                <span className="text-xs text-rose-400">Irreversible destructive action</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              All your startup records, AI simulations, financial projections, and report dossiers will be
              permanently purged from the database.
            </p>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {deleteError}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Enter Account Password:
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your account password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Type <span className="text-rose-400 font-bold">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingAccount || deleteConfirmationText !== 'DELETE' || !deletePassword}
                onClick={handleDeleteAccount}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {deletingAccount ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting Account...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
