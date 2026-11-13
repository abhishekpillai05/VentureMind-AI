import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Sparkles, MailCheck, AlertCircle, RefreshCw, ArrowRight, ArrowLeft, ShieldCheck, Sun, Moon } from 'lucide-react';
import { applyTheme, getStoredTheme } from '../utils/theme';

export const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, saveAuth } = useAuth();

  const email = location.state?.email || user?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);
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

  const inputRefs = useRef([]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!email) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 relative">
        <div className="text-center bg-[#090d16]/80 backdrop-blur-xl border border-white/[0.1] p-8 rounded-3xl max-w-sm shadow-2xl">
          <p className="text-slate-300 text-sm mb-4">No pending verification session found.</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-lg shadow-indigo-600/30"
          >
            Go to Register
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setError(null);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const data = await authService.verifyEmail({ email, otp: code });
      if (data.success) {
        if (data.token && data.user) {
          saveAuth(data);
        }
        setSuccess('Email verified successfully! Redirecting to dashboard...');
        setTimeout(() => navigate('/dashboard', { replace: true }), 1200);
      }
    } catch (err) {
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      const msg = err.response?.data?.message || 'Verification failed. Please check the code.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError(null);
    try {
      await authService.resendOtp({ email });
      setSuccess('A fresh verification code has been dispatched.');
      setCooldown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Dynamic ambient mesh gradients */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[400px] h-[300px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

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
          <div className="text-center mb-7">
            <Link to="/" className="inline-flex items-center gap-3 mb-5 group">
              <img
                src="/favicon.svg"
                alt="VentureMind AI Logo"
                className="w-10 h-10 rounded-2xl shadow-xl shadow-indigo-600/30 group-hover:scale-105 transition-all duration-300"
              />
              <span className="text-xl font-extrabold tracking-tight text-white">
                VentureMind<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 ml-0.5">AI</span>
              </span>
            </Link>

            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-500/10">
              <MailCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Verify Your Email</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              We dispatched a 6-digit confirmation code to{' '}
              <span className="text-indigo-300 font-semibold">{email}</span>
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="mb-5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs sm:text-sm flex items-center gap-2.5">
              <MailCheck className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span className="font-medium">{success}</span>
            </div>
          )}

          {/* OTP Input Form */}
          <form onSubmit={handleVerify}>
            <div className="flex justify-center gap-2 sm:gap-3 mb-6" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`w-11 sm:w-12 h-14 sm:h-16 text-center text-xl sm:text-2xl font-black text-white bg-[#030712]/90 border ${
                    digit ? 'border-indigo-500 shadow-sm shadow-indigo-500/30' : 'border-white/[0.1]'
                  } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 rounded-2xl outline-none transition-all`}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3.5 px-4 rounded-2xl shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify Email Address</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Resend Action */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400 mb-2">Didn't receive the email?</p>
            <button
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 disabled:text-slate-600 disabled:cursor-not-allowed inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              <span>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Verification Code'}</span>
            </button>
          </div>

          <div className="mt-8 pt-5 border-t border-white/[0.08] text-center">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bcrypt protected 6-digit OTP · Expires in 5 minutes</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
