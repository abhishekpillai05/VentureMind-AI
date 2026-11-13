import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Rocket,
  BrainCircuit,
  Globe,
  BarChart3,
  Users,
  Target,
  Award,
  FileText,
  Settings,
  ChevronRight,
} from 'lucide-react';

const navSections = [
  {
    title: 'WORKSPACE',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
      { to: '/dashboard/startups', icon: Rocket, label: 'My Startups' },
    ],
  },
  {
    title: 'AI SIMULATORS',
    items: [
      { to: '/dashboard/validator', icon: BrainCircuit, label: 'Idea Validator' },
      { to: '/dashboard/market-research', icon: Globe, label: 'Market Research' },
      { to: '/dashboard/financial-simulator', icon: BarChart3, label: 'Financial Simulator' },
      { to: '/dashboard/investor', icon: Users, label: 'AI Investor Room' },
      { to: '/dashboard/pitch-evaluation', icon: Target, label: 'Pitch Evaluation' },
    ],
  },
  {
    title: 'ANALYTICS & REPORTS',
    items: [
      { to: '/dashboard/readiness', icon: Award, label: 'Startup Readiness' },
      { to: '/dashboard/reports', icon: FileText, label: 'Executive Reports' },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

export const Sidebar = () => {
  const { user } = useAuth();

  const userPosition =
    user?.headline ||
    (user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Founder & CEO');

  return (
    <aside className="hidden md:flex flex-col w-64 flex-shrink-0 bg-white dark:bg-[#070b14]/90 backdrop-blur-xl border-r border-slate-200 dark:border-white/[0.08] h-full select-none transition-colors duration-200">
      <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <h4 className="px-3 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              {section.title}
            </h4>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-[#EEF2FF] dark:bg-gradient-to-r dark:from-indigo-600/20 dark:to-violet-600/10 text-[#635BFF] dark:text-white font-semibold border border-indigo-200 dark:border-indigo-500/30 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/[0.04]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-[#635BFF] dark:bg-gradient-to-b dark:from-indigo-400 dark:to-violet-400 shadow-sm" />
                      )}
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                          isActive
                            ? 'bg-[#635BFF] text-white shadow-md shadow-indigo-600/30'
                            : 'bg-slate-100 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 group-hover:text-[#635BFF] dark:group-hover:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-slate-800'
                        }`}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Account Name & Position Card */}
      <div className="p-3 border-t border-slate-200 dark:border-white/[0.06] bg-slate-50/60 dark:bg-slate-950/40">
        <Link
          to="/dashboard/settings"
          className="p-2.5 rounded-2xl bg-white dark:bg-[#0b101d] hover:bg-slate-50 dark:hover:bg-[#111827] border border-slate-200 dark:border-white/[0.08] hover:border-indigo-400/50 dark:hover:border-indigo-500/40 shadow-sm transition-all duration-200 flex items-center gap-3 group"
          title="Account Settings & Profile"
        >
          {/* Avatar with status indicator */}
          <div className="relative flex-shrink-0">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user?.full_name || 'Account'}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/30 group-hover:ring-indigo-400 transition-all"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-extrabold shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                {user?.full_name?.charAt(0)?.toUpperCase() || 'F'}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-[#070b14]" />
          </div>

          {/* Account Name & Position */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors truncate leading-tight">
              {user?.full_name || 'Founder'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
              {userPosition}
            </p>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
        </Link>
      </div>
    </aside>
  );
};
