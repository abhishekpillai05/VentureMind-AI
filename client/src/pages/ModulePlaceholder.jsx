import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Construction } from 'lucide-react';

export const ModulePlaceholder = ({ title, description, phase = 'Phase 2' }) => {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6" />
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Scheduled for {phase}
        </span>
        <h1 className="text-2xl font-bold text-white mt-4 mb-2">{title}</h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed mb-6">
          {description ||
            `This module is ready in the architectural blueprint and will be activated in ${phase}.`}
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Overview
        </Link>
      </div>
    </div>
  );
};
