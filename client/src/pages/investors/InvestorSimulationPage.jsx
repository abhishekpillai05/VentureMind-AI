import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Send,
  Sparkles,
  ArrowRight,
  Loader2,
  Award,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  History,
  MessageSquare,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import startupService from '../../services/startupService';
import investorService from '../../services/investorService';
import { useCurrency } from '../../context/CurrencyContext';

export const InvestorSimulationPage = () => {
  const { startupId: paramStartupId } = useParams();
  const navigate = useNavigate();
  const { currency, currencySymbol, format } = useCurrency();

  const [startups, setStartups] = useState([]);
  const [selectedStartupId, setSelectedStartupId] = useState(paramStartupId || '');
  const [loadingStartups, setLoadingStartups] = useState(true);

  // Personas
  const [personas, setPersonas] = useState([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState('marcus_vance');

  // Active Session state
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionsHistory, setSessionsHistory] = useState([]);

  // Evaluation modal/view
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  // 1. Fetch startups & personas
  useEffect(() => {
    const init = async () => {
      try {
        setLoadingStartups(true);
        const [startupRes, personaRes] = await Promise.all([
          startupService.getAllStartups().catch(() => null),
          investorService.getPersonas().catch(() => null),
        ]);

        if (startupRes?.success) {
          const list = startupRes.startups || [];
          setStartups(list);
          if (paramStartupId) {
            setSelectedStartupId(paramStartupId);
          } else if (list.length > 0) {
            setSelectedStartupId(String(list[0].id));
          }
        }

        if (personaRes?.personas) {
          setPersonas(personaRes.personas);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoadingStartups(false);
      }
    };
    init();
  }, [paramStartupId]);

  // 2. Fetch past sessions when startup changes
  useEffect(() => {
    if (!selectedStartupId) return;

    const loadSessions = async () => {
      try {
        const res = await investorService.getSessions(selectedStartupId);
        if (res?.success) {
          setSessionsHistory(res.sessions || []);
        }
      } catch (err) {
        console.error('Error fetching sessions:', err);
      }
    };
    loadSessions();
  }, [selectedStartupId]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // Start new session
  const handleStartSession = async (personaId) => {
    if (!selectedStartupId) return;
    try {
      setError(null);
      setEvaluation(null);
      const res = await investorService.startSession(selectedStartupId, personaId);
      if (res?.success) {
        setActiveSession(res.session);
        setMessages(res.messages || []);
        setSelectedPersonaId(personaId);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize investor simulation.');
    }
  };

  // Resume or view historical session
  const handleLoadSession = async (sessionId) => {
    try {
      setError(null);
      const res = await investorService.getSessionDetails(selectedStartupId, sessionId);
      if (res?.success) {
        setActiveSession(res.session);
        setMessages(res.messages || []);
        setSelectedPersonaId(res.session.persona_id);
        if (res.session.evaluation_report) {
          setEvaluation(res.session.evaluation_report);
        } else {
          setEvaluation(null);
        }
      }
    } catch (err) {
      console.error('Failed to load session:', err);
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || sending || !activeSession) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    setSending(true);
    setError(null);

    // Optimistically append user message
    const tempUserMsg = { id: Date.now(), sender: 'user', message: userText, created_at: new Date() };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await investorService.sendMessage(selectedStartupId, activeSession.id, userText);
      if (res?.success && res.investorMessage) {
        setMessages((prev) => [...prev, res.investorMessage]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Investor was unable to reply. Please retry.');
    } finally {
      setSending(false);
    }
  };

  // Conclude & evaluate session
  const handleEvaluate = async () => {
    if (!activeSession) return;

    try {
      setEvaluating(true);
      setError(null);
      const res = await investorService.evaluateSession(selectedStartupId, activeSession.id);
      if (res?.success && res.evaluation) {
        setEvaluation(res.evaluation);
        setActiveSession((prev) => ({ ...prev, status: 'completed' }));
        // Refresh session list
        const histRes = await investorService.getSessions(selectedStartupId);
        if (histRes?.success) setSessionsHistory(histRes.sessions || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete evaluation. Send at least 2 messages first.');
    } finally {
      setEvaluating(false);
    }
  };

  const selectedStartup = startups.find((s) => String(s.id) === String(selectedStartupId));
  const currentPersona = personas.find((p) => p.id === selectedPersonaId) || personas[0];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Users className="w-6 h-6 text-violet-400" />
            AI Investor Simulation Room
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Rehearse your pitch against distinct venture personalities with tough probing, unit economics grilling, and formal term sheet evaluations.
          </p>
        </div>

        {startups.length > 0 && (
          <div className="flex items-center gap-3">
            <select
              value={selectedStartupId}
              onChange={(e) => {
                setSelectedStartupId(e.target.value);
                setActiveSession(null);
                setEvaluation(null);
              }}
              className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500 font-medium"
            >
              {startups.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.industry})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ─── PERSONA SELECTION STRIP (IF NO ACTIVE SESSION OR SWITCHING) ─── */}
      {!activeSession ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Choose Your Virtual Investor Persona</h2>
            <span className="text-xs text-slate-400">Select an investor archetype to pitch</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {personas.map((persona) => (
              <div
                key={persona.id}
                className="bg-slate-900/60 border border-slate-800 hover:border-violet-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all group hover:bg-slate-900"
              >
                <div>
                  {/* Persona Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={persona.avatar}
                      alt={persona.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 group-hover:border-violet-500 transition-colors"
                    />
                    <div>
                      <h3 className="font-bold text-white text-sm group-hover:text-violet-300 transition-colors">
                        {persona.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-violet-400 block">
                        {persona.archetype}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3 line-clamp-3">
                    {persona.bio}
                  </p>

                  {/* Focus Areas */}
                  <div className="space-y-1 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Core Focus:</span>
                    <div className="flex flex-wrap gap-1">
                      {persona.focusAreas.slice(0, 3).map((f, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] bg-slate-950 border border-slate-800 text-slate-400"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleStartSession(persona.id)}
                  className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Start Pitch Interview</span>
                </button>
              </div>
            ))}
          </div>

          {/* Past Sessions History */}
          {sessionsHistory.length > 0 && (
            <div className="pt-6 border-t border-slate-800/80 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <History className="w-4 h-4" />
                Previous Pitch Sessions ({sessionsHistory.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {sessionsHistory.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleLoadSession(s.id)}
                    className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{s.persona_name}</div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(s.created_at).toLocaleDateString()} • {s.status}
                      </span>
                    </div>
                    {s.evaluation_score && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-violet-500/10 text-violet-300">
                        {s.evaluation_score}/100
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ─── LIVE CHAT ROOM INTERFACE ─── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Persona Brief & Status (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={currentPersona?.avatar}
                  alt={currentPersona?.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-violet-500"
                />
                <div>
                  <h3 className="font-bold text-white text-base">{currentPersona?.name}</h3>
                  <span className="text-xs text-violet-400 font-medium">{currentPersona?.archetype}</span>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Live Interview Session</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-semibold text-slate-200">Investor Mindset: </span>
                {currentPersona?.tone}
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="text-slate-400 font-medium block">Key Scrutiny Areas:</span>
                <div className="flex flex-wrap gap-1">
                  {currentPersona?.focusAreas?.map((area, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-950 border border-slate-800 text-slate-300"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* End & Evaluate Button */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <button
                  onClick={handleEvaluate}
                  disabled={evaluating || messages.length < 3}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold py-2.5 rounded-xl shadow-sm transition-all"
                >
                  {evaluating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating Debrief...</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4" />
                      <span>Conclude & Evaluate Session</span>
                    </>
                  )}
                </button>
                {messages.length < 3 && (
                  <p className="text-[10px] text-center text-slate-500 italic">
                    Exchange at least 2 responses before requesting final investor verdict.
                  </p>
                )}

                <button
                  onClick={() => {
                    setActiveSession(null);
                    setEvaluation(null);
                  }}
                  className="w-full text-xs text-slate-400 hover:text-white py-1"
                >
                  ← Switch Investor Persona
                </button>
              </div>
            </div>

            {/* Quick Prompts Helper */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
              <span className="font-semibold text-slate-300 block">Quick Pitch Defenses:</span>
              <div className="space-y-1.5">
                {[
                  `Our CAC is ${format(4500)} and LTV is ${format(20000)}, giving us a 4.4x payback.`,
                  'We have proprietary integration with soil sensors and predictive ML.',
                  'Our primary moat is data gravity and negative customer churn.',
                ].map((hint, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputMessage(hint)}
                    className="w-full text-left p-2 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[11px] transition-colors"
                  >
                    "{hint}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Chat Thread (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col h-[650px] overflow-hidden">
            {/* Chat Messages Scrollable */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {messages.map((m, idx) => {
                const isUser = m.sender === 'user';
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {!isUser && (
                      <img
                        src={currentPersona?.avatar}
                        alt="Investor"
                        className="w-8 h-8 rounded-full object-cover border border-slate-700 flex-shrink-0 mt-1"
                      />
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? 'bg-violet-600 text-white rounded-tr-none'
                          : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      <div className="font-semibold text-[10px] mb-1 opacity-75">
                        {isUser ? 'You (Founder)' : currentPersona?.name}
                      </div>
                      {m.message}
                    </div>
                  </div>
                );
              })}

              {sending && (
                <div className="flex items-center gap-3">
                  <img
                    src={currentPersona?.avatar}
                    alt="Investor"
                    className="w-8 h-8 rounded-full object-cover border border-slate-700"
                  />
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
                    <span>{currentPersona?.name} is evaluating your response...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                placeholder={`Respond to ${currentPersona?.name}...`}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={sending}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
              <button
                type="submit"
                disabled={sending || !inputMessage.trim()}
                className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── EVALUATION DEBRIEF MODAL / VIEW ─── */}
      {evaluation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 sm:p-8 text-white space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 flex items-center justify-center font-bold text-lg">
                  {evaluation.investorScore}/100
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {evaluation.verdictTitle || 'Investor Pitch Debrief'}
                  </h3>
                  <span className="text-xs text-slate-400">
                    Evaluated by {currentPersona?.name} ({currentPersona?.archetype})
                  </span>
                </div>
              </div>
              <button
                onClick={() => setEvaluation(null)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Close
              </button>
            </div>

            {/* Verdict Callout */}
            <div
              className={`p-4 rounded-xl border text-xs leading-relaxed ${
                evaluation.verdict === 'term_sheet'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : evaluation.verdict === 'follow_up'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <span className="font-bold block mb-1">Executive Debrief:</span>
              {evaluation.overallImpression}
            </div>

            {/* Strengths & Concerns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  What Impressed Me:
                </span>
                <ul className="space-y-1 text-slate-300">
                  {evaluation.strengthsIdentified?.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <span className="font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Major Concerns:
                </span>
                <ul className="space-y-1 text-slate-300">
                  {evaluation.majorConcerns?.map((c, i) => (
                    <li key={i}>• {c}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Suggested Improvements */}
            {evaluation.suggestedImprovements?.length > 0 && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-2">
                <span className="font-bold text-indigo-400">Actionable Pitch Adjustments:</span>
                <ul className="space-y-1.5 text-slate-300">
                  {evaluation.suggestedImprovements.map((imp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 text-center">
              <button
                onClick={() => setEvaluation(null)}
                className="px-6 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
              >
                Return to Interview Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorSimulationPage;
