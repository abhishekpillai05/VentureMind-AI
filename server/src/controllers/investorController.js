import { getStartupByIdAndUser } from '../models/startupModel.js';
import {
  createInvestorSession,
  getInvestorSessionById,
  getInvestorSessionsByStartup,
  saveChatMessage,
  getChatMessagesBySession,
  completeInvestorSession,
} from '../models/investorModel.js';
import { updateModuleReadinessScore } from '../models/readinessModel.js';
import {
  INVESTOR_PERSONAS,
  buildInvestorChatPrompt,
} from '../prompts/investorPrompt.js';
import {
  generateInvestorChatResponseWithAI,
  generateInvestorSessionEvaluationWithAI,
} from '../services/geminiService.js';
import { AppError } from '../middleware/errorHandler.js';

export const getPersonas = (req, res) => {
  res.status(200).json({
    success: true,
    personas: Object.values(INVESTOR_PERSONAS),
  });
};

export const startSession = async (req, res, next) => {
  try {
    const startupId = Number(req.params.startupId);
    const { personaId } = req.body;

    const startup = await getStartupByIdAndUser(startupId, req.user.id);
    if (!startup) {
      return next(new AppError('Startup not found or unauthorized.', 404));
    }

    const persona = INVESTOR_PERSONAS[personaId] || INVESTOR_PERSONAS.marcus_vance;

    // 1. Create Session
    const session = await createInvestorSession({
      startup_id: startup.id,
      persona_id: persona.id,
      persona_name: persona.name,
    });

    // 2. Insert Investor Opening Greeting
    const openingMsg = await saveChatMessage({
      session_id: session.id,
      sender: 'investor',
      message: persona.greeting,
      tone_or_sentiment: 'probing',
    });

    res.status(201).json({
      success: true,
      message: `Pitch session initiated with ${persona.name}.`,
      session,
      persona,
      messages: [openingMsg],
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const startupId = Number(req.params.startupId);
    const sessionId = Number(req.params.sessionId);
    const { message } = req.body;

    if (!message || !message.trim()) {
      return next(new AppError('Message text cannot be empty.', 400));
    }

    const startup = await getStartupByIdAndUser(startupId, req.user.id);
    if (!startup) {
      return next(new AppError('Startup not found or unauthorized.', 404));
    }

    const session = await getInvestorSessionById(sessionId);
    if (!session || session.startup_id !== startup.id) {
      return next(new AppError('Investor session not found.', 404));
    }

    // 1. Save User Message
    const userMsg = await saveChatMessage({
      session_id: session.id,
      sender: 'user',
      message: message.trim(),
    });

    // 2. Fetch full message history
    const allMessages = await getChatMessagesBySession(session.id);

    // 3. Generate Investor Reply via Gemini
    const replyText = await generateInvestorChatResponseWithAI(
      startup,
      session.persona_id,
      allMessages
    );

    // 4. Save Investor Reply
    const investorMsg = await saveChatMessage({
      session_id: session.id,
      sender: 'investor',
      message: replyText,
    });

    res.status(200).json({
      success: true,
      userMessage: userMsg,
      investorMessage: investorMsg,
    });
  } catch (error) {
    next(error);
  }
};

export const evaluateSession = async (req, res, next) => {
  try {
    const startupId = Number(req.params.startupId);
    const sessionId = Number(req.params.sessionId);

    const startup = await getStartupByIdAndUser(startupId, req.user.id);
    if (!startup) {
      return next(new AppError('Startup not found or unauthorized.', 404));
    }

    const session = await getInvestorSessionById(sessionId);
    if (!session || session.startup_id !== startup.id) {
      return next(new AppError('Investor session not found.', 404));
    }

    const messages = await getChatMessagesBySession(session.id);
    if (messages.length < 3) {
      return next(
        new AppError('Need at least 2 exchanges with the investor before generating evaluation.', 400)
      );
    }

    // 1. Generate Evaluation from Gemini
    const evaluation = await generateInvestorSessionEvaluationWithAI(
      startup,
      session.persona_id,
      messages
    );

    // 2. Complete Session in MySQL
    await completeInvestorSession({
      session_id: session.id,
      verdict: evaluation.verdict || 'follow_up',
      evaluation_score: evaluation.investorScore || 75,
      evaluation_report: evaluation,
      feedback_summary: evaluation.overallImpression,
    });

    // 3. Update Readiness Score
    await updateModuleReadinessScore({
      startup_id: startup.id,
      moduleType: 'investor',
      score: evaluation.investorScore || 75,
    });

    res.status(200).json({
      success: true,
      message: 'Investor pitch session concluded and evaluated!',
      evaluation,
    });
  } catch (error) {
    next(error);
  }
};

export const getStartupSessions = async (req, res, next) => {
  try {
    const startupId = Number(req.params.startupId);
    const startup = await getStartupByIdAndUser(startupId, req.user.id);
    if (!startup) {
      return next(new AppError('Startup not found or unauthorized.', 404));
    }

    const sessions = await getInvestorSessionsByStartup(startupId);
    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    next(error);
  }
};

export const getSessionDetails = async (req, res, next) => {
  try {
    const startupId = Number(req.params.startupId);
    const sessionId = Number(req.params.sessionId);

    const startup = await getStartupByIdAndUser(startupId, req.user.id);
    if (!startup) {
      return next(new AppError('Startup not found or unauthorized.', 404));
    }

    const session = await getInvestorSessionById(sessionId);
    if (!session || session.startup_id !== startup.id) {
      return next(new AppError('Session not found.', 404));
    }

    const messages = await getChatMessagesBySession(session.id);
    const persona = INVESTOR_PERSONAS[session.persona_id] || INVESTOR_PERSONAS.marcus_vance;

    res.status(200).json({
      success: true,
      session,
      persona,
      messages,
    });
  } catch (error) {
    next(error);
  }
};
