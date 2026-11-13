import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  Sun,
  Moon,
  Loader2,
} from 'lucide-react';
import { applyTheme, getStoredTheme } from '../utils/theme';

const getPasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { score, label: 'Weak', color: 'bg-rose-500' };
  if (score <= 2) return { score, label: 'Fair', color: 'bg-amber-500' };
  if (score <= 3) return { score, label: 'Good', color: 'bg-yellow-400' };
  if (score <= 4) return { score, label: 'Strong', color: 'bg-emerald-400' };
  return { score, label: 'Very Strong', color: 'bg-emerald-500' };
};

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  // State
  const [step, setStep] = useState(1); // 1 = Enter Email, 2 = Enter OTP & New Password, 3 = Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentTheme, setCurrentTheme] = useState(getStoredTheme());

  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentTheme(getStoredTheme());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(newTheme);
    applyTheme(newTheme);
  };

  // Cooldown countdown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const strength = getPasswordStrength(newPassword);

  // Step 1: Request Password Reset OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword({ email: trimmedEmail });
      setSuccessMessage(res.message || 'Verification code sent to your email.');
      setCooldown(60);
      setStep(2);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Unable to send password reset code. Please verify your email address.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0 || resending) return;
    setError(null);
    setResending(true);

    try {
      const res = await authService.forgotPassword({ email: email.trim().toLowerCase() });
      setSuccessMessage('A fresh verification code has been dispatched.');
      setCooldown(60);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to resend verification code. Please try again.';
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  // Step 2: Verify OTP and Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setStep(3);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to reset password. Please check your verification code and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Dynamic ambient mesh gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[400px] h-[300px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Centered Auth Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#090d16]/80 backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/80 relative">
          {/* Top Left Return to Landing Page */}
          <div className="absolute top-5 left-5">
            <Link
              to="/"
              className="p-2 inline-flex items-center justify-center text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/[0.08] hover:border-indigo-400/40 transition-all duration-200 group"
              title="Return to Landing Page"
              aria-label="Return to landing page"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Top Right Theme Toggle */}
          <div className="absolute top-5 right-5">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-amber-300 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/[0.08] hover:border-indigo-400/40 transition-all duration-200"
              title={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle theme"
            >
              {currentTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 hover:-rotate-12 transition-transform" />
              )}
            </button>
          </div>

          {/* Brand Logo & Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3 mb-5 group">
              <img
                src="/favicon.svg"
                alt="VentureMind AI Logo"
                className="w-11 h-11 rounded-2xl shadow-xl shadow-indigo-600/30 group-hover:scale-105 transition-all duration-300"
              />
              <span className="text-xl font-extrabold tracking-tight text-white">
                VentureMind<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 ml-0.5">AI</span>
              </span>
            </Link>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {step === 1 && 'Reset Password'}
              {step === 2 && 'Verify & Set Password'}
              {step === 3 && 'Password Reset Complete'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
              {step === 1 && 'Enter your email to receive a 6-digit verification code.'}
              {step === 2 && `Enter the verification code sent to ${email}`}
              {step === 3 && 'Your account credentials have been successfully updated.'}
            </p>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs sm:text-sm flex items-start gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" />
              <span className="leading-relaxed">{successMessage}</span>
            </div>
          )}

          {/* ─── STEP 1: REQUEST OTP ─── */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Account Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="founder@example.com"
                    className="w-full bg-[#030712]/90 border border-white/[0.1] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="text-xs text-slate-400 hover:text-indigo-400 transition-colors inline-flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Remember your password? Sign In</span>
                </Link>
              </div>
            </form>
          )}

          {/* ─── STEP 2: VERIFY OTP & RESET PASSWORD ─── */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* Email Tag with Change Option */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] text-xs">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <span className="text-slate-300 font-medium truncate">{email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold text-[11px] underline ml-2 flex-shrink-0"
                >
                  Change Email
                </button>
              </div>

              {/* 6-Digit OTP Code */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    6-Digit Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={cooldown > 0 || resending}
                    className="text-xs text-indigo-400 hover:text-indigo-300 disabled:text-slate-600 font-medium transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                    <span>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}</span>
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full bg-[#030712]/90 border border-white/[0.1] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 tracking-widest font-mono outline-none transition-all"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full bg-[#030712]/90 border border-white/[0.1] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl pl-10 pr-11 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Strength:</span>
                      <span className={`font-semibold ${strength.color.replace('bg-', 'text-')}`}>
                        {strength.label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all duration-300`}
                        style={{ width: `${(strength.score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="w-full bg-[#030712]/90 border border-white/[0.1] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl pl-10 pr-11 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && (
                  <p className="text-[11px] mt-1.5">
                    {newPassword === confirmPassword ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                      </span>
                    ) : (
                      <span className="text-rose-400">Passwords do not match</span>
                    )}
                  </p>
                )}
              </div>

              {/* Security Requirements */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] space-y-1 text-slate-400">
                <span className="font-semibold text-slate-300 block mb-1">Security Criteria:</span>
                <div className="grid grid-cols-2 gap-1">
                  <span className={newPassword.length >= 8 ? 'text-emerald-400' : 'text-slate-500'}>
                    • 8+ characters
                  </span>
                  <span className={/[A-Z]/.test(newPassword) ? 'text-emerald-400' : 'text-slate-500'}>
                    • Uppercase letter
                  </span>
                  <span className={/[a-z]/.test(newPassword) ? 'text-emerald-400' : 'text-slate-500'}>
                    • Lowercase letter
                  </span>
                  <span className={/[0-9]/.test(newPassword) ? 'text-emerald-400' : 'text-slate-500'}>
                    • Number
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  otp.length !== 6 ||
                  newPassword.length < 8 ||
                  newPassword !== confirmPassword
                }
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Reset Password</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ─── STEP 3: SUCCESS CONFIRMATION ─── */}
          {step === 3 && (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Your password has been changed successfully. You can now use your new credentials to sign in to your founder intelligence workspace.
                </p>
              </div>

              <Link
                to="/login"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <span>Sign In to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
