import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Sparkles, LogOut, ArrowRight, Zap, ShieldCheck, Sun, Moon } from 'lucide-react';
import { applyTheme, getStoredTheme } from '../../utils/theme';
import userService from '../../services/userService';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { currency, currencySymbol, setCurrency, rateDate } = useCurrency();
  const navigate = useNavigate();
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
    if (isAuthenticated) {
      userService.updatePreferences({ theme: newTheme }).catch(() => {});
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] h-16 w-full backdrop-blur-2xl bg-[#030712]/95 border-b border-white/[0.08] shadow-2xl shadow-black/60 transition-all">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between max-w-7xl mx-auto">
        {/* Brand Logo */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-3 group">
          <img
            src="/favicon.svg"
            alt="VentureMind AI Logo"
            className="w-9 h-9 rounded-xl shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-all duration-300"
          />
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center">
              VentureMind<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 ml-1">AI</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider -mt-1 hidden sm:inline">
              CO-FOUNDER SIMULATOR
            </span>
          </div>
        </Link>

        {/* Live System Indicator (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 border border-white/[0.06] text-[11px] font-medium text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-emerald-400 font-semibold">Gemini Intelligence</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">v2.5 Live</span>
        </div>

        {/* Actions & Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {isAuthenticated ? (
            <>
              {/* Currency Selector Pill */}
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/[0.08] hover:border-indigo-500/40 text-xs font-semibold text-slate-300 transition-all duration-200 shadow-sm"
                title={`Active currency: ${currency}. Live rates cached as of ${rateDate}`}
              >
                <span className="text-indigo-400 font-bold">{currencySymbol}</span>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
                  aria-label="Select display currency"
                >
                  <option value="INR" className="bg-[#0b1120] text-white">INR (₹)</option>
                  <option value="USD" className="bg-[#0b1120] text-white">USD ($)</option>
                  <option value="EUR" className="bg-[#0b1120] text-white">EUR (€)</option>
                  <option value="GBP" className="bg-[#0b1120] text-white">GBP (£)</option>
                </select>
              </div>

              {/* Light / Dark Mode Toggle Pill */}
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

              {/* User Profile Pill */}
              <Link
                to="/dashboard/settings"
                className="flex items-center gap-2.5 px-2.5 py-1 rounded-xl bg-slate-900/40 hover:bg-slate-800/60 border border-transparent hover:border-white/[0.08] transition-all group"
                title="Account Settings"
              >
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors leading-none">
                    {user?.full_name || 'Founder'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">{user?.role || 'Founder'}</span>
                </div>
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name || 'Avatar'}
                    className="w-8 h-8 rounded-xl object-cover ring-2 ring-indigo-500/30 group-hover:ring-indigo-400 transition-all"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600/30 to-violet-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 text-xs font-bold group-hover:border-indigo-400 shadow-sm">
                    {user?.full_name?.charAt(0)?.toUpperCase() || 'F'}
                  </div>
                )}
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
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
              <Link
                to="/login"
                className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-white/[0.05] transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="group relative inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all"
              >
                <span>Launch App</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
