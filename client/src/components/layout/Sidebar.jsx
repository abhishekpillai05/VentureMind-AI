import React from 'react';
import { NavLink } from 'react-router-dom';
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
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/dashboard/startups', icon: Rocket, label: 'My Startups' },
  { to: '/dashboard/validator', icon: BrainCircuit, label: 'Idea Validator' },
  { to: '/dashboard/market-research', icon: Globe, label: 'Market Research' },
  { to: '/dashboard/financial-simulator', icon: BarChart3, label: 'Financial Simulator' },
  { to: '/dashboard/investor', icon: Users, label: 'AI Investor Room' },
  { to: '/dashboard/pitch-evaluation', icon: Target, label: 'Pitch Evaluation' },
  { to: '/dashboard/readiness', icon: Award, label: 'Startup Readiness' },
  { to: '/dashboard/reports', icon: FileText, label: 'Executive Reports' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export const Sidebar = () => {
  return (
    <aside className="hidden md:flex flex-col w-56 flex-shrink-0 bg-slate-900/40 border-r border-slate-800/60 h-[calc(100vh-4rem)]">
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`
            }
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
