import React from 'react';
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
} from 'lucide-react';
import { HeroVisual } from '../components/landing/HeroVisual';

const features = [
  {
    icon: BrainCircuit,
    title: 'AI Startup Idea Validation',
    desc: 'Stress-test your business concept with instant Lean Canvas generation, SWOT matrix analysis, and quantitative problem-solution fit scoring.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
  {
    icon: Globe,
    title: 'Market Research & Competitor Analysis',
    desc: 'Size your addressable opportunity with automated TAM, SAM, and SOM estimation, competitor benchmarking, and strategic moat identification.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: TrendingUp,
    title: 'Financial & Revenue Simulation',
    desc: 'Simulate unit economics, customer acquisition costs (CAC), lifetime value (LTV), churn rates, and 3-year revenue trajectories.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    icon: Users,
    title: 'Multi-Persona AI Investor Simulation',
    desc: 'Pitch to diverse virtual venture capital archetypes—from aggressive growth VCs to conservative angels—who grill your assumptions.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  {
    icon: Target,
    title: 'AI Pitch Evaluation',
    desc: 'Submit your elevator pitch or deck notes to receive 5-axis quantitative scoring across clarity, defensibility, scalability, and presentation.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    icon: Award,
    title: 'Startup Readiness Score',
    desc: 'Track an algorithmic 0–100 investability index that synthesizes validation strength, unit economics, market depth, and pitch quality.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
];

const steps = [
  {
    num: '01',
    icon: Lightbulb,
    title: 'Submit Your Startup Idea',
    desc: 'Enter your core value proposition, target customer segment, industry, and the critical problem your product solves.',
  },
  {
    num: '02',
    icon: BrainCircuit,
    title: 'Validate Your Idea',
    desc: 'The validation engine performs automated feasibility grading, SWOT evaluation, and problem-solution alignment.',
  },
  {
    num: '03',
    icon: BarChart3,
    title: 'Analyse the Market & Simulate Finances',
    desc: 'Calculate TAM/SAM/SOM market sizing and model pricing strategies, CAC, LTV, and monthly runway projections.',
  },
  {
    num: '04',
    icon: Users,
    title: 'Practise Pitching with AI Investors',
    desc: 'Face real-time interactive questioning from distinct virtual investor personas challenging your unit economics and moat.',
  },
  {
    num: '05',
    icon: FileCheck2,
    title: 'Get Your Startup Readiness Report',
    desc: 'Obtain an aggregated Readiness Score and export a comprehensive executive summary ready for angel investors and accelerators.',
  },
];

const whyReasons = [
  {
    icon: Zap,
    title: 'Rapid Feedback in Minutes',
    desc: 'Eliminate months of trial-and-error by receiving thorough analytical validation in minutes before writing code.',
  },
  {
    icon: ShieldCheck,
    title: 'Data-Backed Decision Making',
    desc: 'Replace assumptions and gut feeling with structured frameworks, competitor matrices, and financial ratios.',
  },
  {
    icon: TrendingUp,
    title: 'Unit Economics Transparency',
    desc: 'Uncover hidden churn risks, unsustainable CAC, and pricing bottlenecks before seeking investment.',
  },
  {
    icon: Users,
    title: 'Zero-Risk Pitch Rehearsal',
    desc: 'Build unflappable confidence by answering tough investor objections in a safe, private training simulator.',
  },
];

export const LandingPage = () => {
  return (
    <div className="bg-[#070b14] text-slate-100 min-h-screen selection:bg-indigo-500 selection:text-white">
      {/* ─── NAVIGATION BAR ─── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070b14]/85 border-b border-slate-800/60">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-600/25 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              VentureMind<span className="text-indigo-400 ml-0.5">AI</span>
            </span>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#hero" className="hover:text-white transition-colors duration-200">
              Home
            </a>
            <a href="#features" className="hover:text-white transition-colors duration-200">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors duration-200">
              How It Works
            </a>
            <a href="#about" className="hover:text-white transition-colors duration-200">
              About
            </a>
          </div>

          {/* Auth CTA */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-300 hover:text-white px-3.5 py-1.5 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section id="hero" className="relative pt-20 pb-24 overflow-hidden">
        {/* Subtle animated ambient background orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none animate-float-slow" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none animate-float-reverse" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          {/* Subtle Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Entrepreneur Trainer & Startup Simulator</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-6">
            Your Startup Idea Deserves
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-300">
              More Than Just a Guess.
            </span>
          </h1>

          {/* Supporting Description */}
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Validate startup assumptions, size market opportunities, simulate business finances,
            and practice pitching to virtual AI investors — before risking your capital.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/45 transition-all duration-200 group"
            >
              <span>Validate Your Idea</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-slate-600 px-6 py-3.5 rounded-xl font-medium text-sm transition-all duration-200"
            >
              Explore Platform
            </a>
          </div>

          {/* Clean Abstract Visual Representation (No fake dashboards) */}
          <HeroVisual />
        </div>
      </section>

      {/* ─── FEATURES SECTION (ALL 6 CORE MODULES) ─── */}
      <section id="features" className="py-24 border-t border-slate-800/50 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">
              Platform Capabilities
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Six Comprehensive Validation Modules
            </h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Every tool an aspiring founder needs to stress-test their startup idea, analyze market opportunities, and build investor readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className={`group rounded-2xl border ${f.border} bg-slate-900/40 p-6 hover:bg-slate-900/70 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between`}
              >
                <div>
                  <div
                    className={`w-11 h-11 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200`}
                  >
                    <f.icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS SECTION (5 CONNECTED STEPS) ─── */}
      <section id="how-it-works" className="py-24 bg-slate-900/30 border-t border-slate-800/50 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">
              Methodology
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              How VentureMind AI Works
            </h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              A structured 5-step journey that turns raw assumptions into tested, defensible startup models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {steps.map((s, idx) => (
              <div
                key={s.num}
                className="relative rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-indigo-500/40 font-mono">
                      {s.num}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <s.icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2 leading-snug">{s.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT / WHY VENTUREMIND SECTION ─── */}
      <section id="about" className="py-24 border-t border-slate-800/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">
              About VentureMind
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Why Validate With VentureMind AI?
            </h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto text-sm sm:text-base">
              Over 90% of startups fail due to building products the market doesn't need. We provide the safety net of automated critical analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {whyReasons.map((r) => (
              <div
                key={r.title}
                className="flex gap-4 p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/80 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-indigo-400">
                  <r.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1.5">{r.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="py-20 border-t border-slate-800/50 relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
            Ready to validate your startup idea?
          </h2>
          <p className="text-slate-400 mb-8 text-sm max-w-lg mx-auto leading-relaxed">
            Create your founder account, define your venture parameters, and receive actionable insights in minutes.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all duration-200"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-slate-800/50 py-12 bg-[#060910]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-bold text-white tracking-tight">
                  VentureMind<span className="text-indigo-400">AI</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                AI-driven entrepreneur trainer and startup simulator empowering founders to validate before building.
              </p>
            </div>

            <div className="flex gap-16 text-xs">
              <div>
                <p className="text-slate-300 font-semibold mb-3 uppercase tracking-wider text-[11px]">
                  Navigation
                </p>
                <ul className="space-y-2 text-slate-400">
                  <li>
                    <a href="#hero" className="hover:text-white transition-colors">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="#features" className="hover:text-white transition-colors">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#how-it-works" className="hover:text-white transition-colors">
                      How It Works
                    </a>
                  </li>
                  <li>
                    <a href="#about" className="hover:text-white transition-colors">
                      About
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <p className="text-slate-300 font-semibold mb-3 uppercase tracking-wider text-[11px]">
                  Account
                </p>
                <ul className="space-y-2 text-slate-400">
                  <li>
                    <Link to="/login" className="hover:text-white transition-colors">
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="hover:text-white transition-colors">
                      Get Started
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-800/60 text-center">
            <p className="text-[11px] text-slate-600">
              © {new Date().getFullYear()} VentureMind AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
