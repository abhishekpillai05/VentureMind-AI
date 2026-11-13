import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Sparkles, LogOut, Globe } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { currency, currencySymbol, setCurrency, rateDate } = useCurrency();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 h-16 backdrop-blur-lg bg-slate-950/80 border-b border-slate-800/60">
      <div className="h-full px-6 flex items-center justify-between">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            VentureMind<span className="text-indigo-400 ml-0.5">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Quick Currency Selector */}
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-semibold text-slate-300 hover:border-slate-700 transition-colors"
                title={`Active currency: ${currency}. Live rates cached as of ${rateDate}`}
              >
                <span className="text-indigo-400 font-bold">{currencySymbol}</span>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
                  aria-label="Select display currency"
                >
                  <option value="INR" className="bg-slate-900 text-white">INR (₹)</option>
                  <option value="USD" className="bg-slate-900 text-white">USD ($)</option>
                  <option value="EUR" className="bg-slate-900 text-white">EUR (€)</option>
                  <option value="GBP" className="bg-slate-900 text-white">GBP (£)</option>
                </select>
              </div>

              <Link
                to="/dashboard/settings"
                className="flex items-center gap-2.5 px-2 py-1 rounded-xl hover:bg-slate-900/60 transition-colors group"
                title="Account Settings"
              >
                <div className="hidden sm:flex flex-col text-right mr-1">
                  <span className="text-xs font-medium text-white group-hover:text-indigo-300 transition-colors leading-none">
                    {user?.full_name || 'Founder'}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5">{user?.email}</span>
                </div>
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name || 'Avatar'}
                    className="w-8 h-8 rounded-full object-cover border border-indigo-500/40"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-sm font-semibold group-hover:border-indigo-400 transition-colors">
                    {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800/50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-slate-300 hover:text-white px-3 py-1.5 transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
