import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Sparkles, MailCheck, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';

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

  const inputRefs = useRef([]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!email) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-6">
        <div className="text-center bg-slate-900/60 border border-slate-800 p-8 rounded-2xl max-w-sm">
          <p className="text-slate-300 text-sm mb-4">No pending verification session found.</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg text-xs transition-colors"
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
    <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Centered Auth Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 sm:p-9 shadow-2xl shadow-black/60">
          {/* Brand Logo & Header */}
          <div className="text-center mb-7">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-600/25 group-hover:scale-105 transition-transform duration-200">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                VentureMind<span className="text-indigo-400">AI</span>
              </span>
            </Link>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <MailCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Verify Your Email</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
              We sent a 6-digit confirmation code to{' '}
              <span className="text-slate-200 font-semibold">{email}</span>
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs sm:text-sm flex items-center gap-2.5">
              <MailCheck className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          {/* OTP Input Form */}
          <form onSubmit={handleVerify}>
            <div className="flex justify-center gap-2.5 sm:gap-3 mb-6" onPaste={handlePaste}>
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
                  className="w-11 sm:w-12 h-13 sm:h-14 text-center text-xl font-bold text-white bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none transition-colors"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify Email</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Resend Action */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 mb-1.5">Didn't receive the code?</p>
            <button
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 disabled:text-slate-600 disabled:cursor-not-allowed inline-flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              <span>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Verification Code'}</span>
            </button>
          </div>

          <div className="mt-7 pt-5 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-500">
              Codes expire in 5 minutes for account security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
