import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  BrainCircuit,
  Globe,
  TrendingUp,
  Users,
  Target,
  Award,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  BarChart3,
  Rocket,
  ShieldCheck,
  Zap,
  ChevronRight,
  FileCheck2,
  Layers,
  Database,
  ArrowUpRight,
  Sun,
  Moon,
} from 'lucide-react';
import { HeroVisual } from '../components/landing/HeroVisual';
import { applyTheme, getStoredTheme } from '../utils/theme';

const features = [
  {
    icon: BrainCircuit,
    title: 'AI Startup Idea Validation',
    desc: 'Stress-test your business concept with instant Lean Canvas generation, SWOT matrix analysis, and quantitative problem-solution fit scoring.',
    color: 'text-indigo-400',
    border: 'hover:border-indigo-500/50',
    glow: 'group-hover:shadow-indigo-500/20',
    tag: 'Idea Stage',
  },
  {
    icon: Globe,
    title: 'Market Research & Competitor Sizing',
    desc: 'Size your addressable opportunity with automated TAM, SAM, and SOM estimation, competitor benchmarking, and strategic moat identification.',
    color: 'text-cyan-400',
    border: 'hover:border-cyan-500/50',
    glow: 'group-hover:shadow-cyan-500/20',
    tag: 'Market Fit',
  },
  {
    icon: TrendingUp,
    title: 'Financial & Runway Simulator',
    desc: 'Simulate unit economics, customer acquisition costs (CAC), lifetime value (LTV), monthly churn rates, and 3-year revenue trajectories.',
    color: 'text-emerald-400',
    border: 'hover:border-emerald-500/50',
    glow: 'group-hover:shadow-emerald-500/20',
    tag: 'Economics',
  },
  {
    icon: Users,
    title: 'Multi-Persona AI Investor Room',
    desc: 'Pitch to diverse virtual venture capital archetypes—from aggressive growth VCs to conservative angels—who question your assumptions.',
    color: 'text-violet-400',
    border: 'hover:border-violet-500/50',
    glow: 'group-hover:shadow-violet-500/20',
    tag: 'Fundraising',
  },
  {
    icon: Target,
    title: '5-Axis Pitch Evaluation',
    desc: 'Submit your elevator pitch or deck notes to receive 5-axis quantitative scoring across clarity, defensibility, scalability, and presentation.',
    color: 'text-blue-400',
    border: 'hover:border-blue-500/50',
    glow: 'group-hover:shadow-blue-500/20',
    tag: 'Presentation',
  },
  {
    icon: Award,
    title: 'Startup Readiness Score',
    desc: 'Track an algorithmic 0–100 investability index that synthesizes validation strength, unit economics, market depth, and pitch quality.',
    color: 'text-amber-400',
    border: 'hover:border-amber-500/50',
    glow: 'group-hover:shadow-amber-500/20',
    tag: 'Synthesis',
  },
];

const steps = [
  {
    num: '01',
    icon: Lightbulb,
    title: 'Define Venture',
    desc: 'Enter your core value proposition, target customer, problem statement, and revenue model.',
  },
  {
    num: '02',
    icon: BrainCircuit,
    title: 'Stress-Test Idea',
    desc: 'Gemini AI evaluates problem-solution fit, performs SWOT analysis, and uncovers blind spots.',
  },
  {
    num: '03',
    icon: BarChart3,
    title: 'Size & Model',
    desc: 'Estimate TAM/SAM/SOM market sizing, runway burn, CAC, LTV, and pricing sensitivities.',
  },
  {
    num: '04',
    icon: Users,
    title: 'Pitch Virtual VCs',
    desc: 'Engage in live interactive pushback with diverse AI investor personas to polish defensibility.',
  },
  {
    num: '05',
    icon: FileCheck2,
    title: 'Readiness Report',
    desc: 'Generate a comprehensive readiness score and export investor-ready executive summaries.',
  },
];

const metrics = [
  { value: '$4.8B+', label: 'Market Opportunity Sized', detail: 'Across 1,200+ venture concepts' },
  { value: '94.8%', label: 'Investor Alignment', detail: 'Consistent with Tier 1 VC criteria' },
  { value: '15,000+', label: 'AI Pitch Simulations', detail: 'Interactive conversational turns' },
  { value: '0 - 100', label: 'Deterministic Index', detail: 'Transparent quantitative grading' },
];

export const LandingPage = () => {
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

  return (
    <div className="bg-[#030712] text-slate-100 min-h-screen selection:bg-indigo-500 selection:text-white relative">
      {/* ─── FIXED GLOBAL NAVIGATION (STAYS PINNED AT TOP ON SCROLL) ─── */}
      <header className="fixed top-0 left-0 right-0 z-[100] w-full backdrop-blur-2xl bg-[#030712]/95 border-b border-white/[0.08] shadow-2xl shadow-black/60">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/favicon.svg"
              alt="VentureMind AI Logo"
              className="w-9 h-9 rounded-xl shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-all duration-300"
            />
            <span className="text-lg font-extrabold tracking-tight text-white">
              VentureMind<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 ml-0.5">AI</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <a href="#hero" className="hover:text-white transition-colors">Overview</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Methodology</a>
            <a href="#metrics" className="hover:text-white transition-colors">Impact</a>
          </div>

          {/* Auth CTA & Theme Toggle */}
          <div className="flex items-center gap-3">
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
              className="text-xs sm:text-sm font-semibold text-white px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all flex items-center gap-1.5"
            >
              <span>Launch Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section id="hero" className="relative pt-24 sm:pt-32 pb-20 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-sm dark:shadow-inner">
            <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
            <span>Next-Gen Co-Founder & Venture Simulator</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6">
            Build, Stress-Test & Pitch
            <br />
            <span className="hero-headline-gradient">
              Before Writing A Single Line of Code.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Validate assumptions, size addressable markets, model unit economics, and face realistic AI investors who grill your business model in real-time.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 hover:from-indigo-500 hover:to-violet-500 text-white font-bold px-7 py-4 rounded-2xl shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] transition-all group"
            >
              <span>Validate Your Startup Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.1] px-6 py-4 rounded-2xl font-semibold text-sm transition-all shadow-sm"
            >
              Explore 6 Modules
            </a>
          </div>

          {/* Hero Visual Preview */}
          <HeroVisual />
        </div>
      </section>

      {/* ─── LIVE METRICS STRIP ─── */}
      <section id="metrics" className="py-16 border-y border-slate-200 dark:border-white/[0.06] bg-slate-50/70 dark:bg-slate-950/40 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="p-5 rounded-2xl bg-white dark:bg-[#090d16]/60 border border-slate-200/80 dark:border-white/[0.06] shadow-sm dark:shadow-none backdrop-blur-md hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all"
              >
                <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 dark:from-indigo-400 dark:via-white dark:to-cyan-300">
                  {m.value}
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-2">{m.label}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{m.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6 COMPREHENSIVE MODULES ─── */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
              Core Architecture
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mt-4">
              Six Comprehensive Validation Modules
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-4 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Every tool a founder needs to transform an unverified idea into an investor-ready business model.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className={`group rounded-3xl border border-slate-200 dark:border-white/[0.08] ${f.border} bg-white dark:bg-[#090d16]/70 backdrop-blur-xl p-6 sm:p-7 transition-all duration-300 shadow-sm dark:shadow-xl ${f.glow} flex flex-col justify-between hover:-translate-y-1`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <f.icon className={`w-6 h-6 ${f.color}`} />
                    </div>
                    <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.06]">
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">
                  <span>Explore Module</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5-STEP METHODOLOGY ─── */}
      <section id="how-it-works" className="py-24 bg-slate-50/60 dark:bg-slate-950/40 border-t border-slate-200 dark:border-white/[0.06] relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20">
              The Protocol
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mt-4">
              How VentureMind AI Works
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-4 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              A structured 5-step journey that replaces guessing with structured analytical verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((s) => (
              <div
                key={s.num}
                className="relative rounded-2xl bg-white dark:bg-[#090d16]/80 border border-slate-200 dark:border-white/[0.08] p-5 flex flex-col justify-between hover:border-indigo-400 dark:hover:border-indigo-500/40 transition-all duration-300 shadow-sm dark:shadow-none group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-mono">
                      {s.num}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                      <s.icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 leading-snug">{s.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA BANNER ─── */}
      <section className="py-24 border-t border-white/[0.06] relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-b from-[#11192e] to-[#090d16] border border-indigo-500/30 shadow-2xl shadow-indigo-950/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
            
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              Zero Risk · Instant Validation
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4 mb-4">
              Ready to test your startup thesis?
            </h2>
            <p className="text-slate-400 mb-8 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              Join founders validating their business ideas, unit economics, and pitches with AI before raising capital.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/[0.06] py-12 bg-[#02050e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <img
              src="/favicon.svg"
              alt="VentureMind AI Logo"
              className="w-8 h-8 rounded-xl shadow-md shadow-indigo-600/20"
            />
            <span className="text-sm font-bold text-white">
              VentureMind<span className="text-indigo-400">AI</span>
            </span>
            <span className="text-xs text-slate-500 ml-2">© {new Date().getFullYear()} VentureMind AI</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <a href="#hero" className="hover:text-white transition-colors">Overview</a>
            <a href="#features" className="hover:text-white transition-colors">Modules</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Methodology</a>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
