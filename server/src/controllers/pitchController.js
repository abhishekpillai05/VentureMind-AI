import { getStartupByIdAndUser } from '../models/startupModel.js';
import {
  savePitchEvaluation,
  getLatestPitchEvaluationByStartup,
  getPitchHistoryByStartup,
} from '../models/pitchModel.js';
import { updateModuleReadinessScore } from '../models/readinessModel.js';
import { evaluatePitchWithAI } from '../services/geminiService.js';
import { AppError } from '../middleware/errorHandler.js';

export const evaluatePitch = async (req, res, next) => {
  try {
    const startupId = Number(req.params.startupId);
    const { pitchTranscript, durationMinutes } = req.body;

    if (!pitchTranscript || pitchTranscript.trim().length < 30) {
      return next(
        new AppError('Pitch transcript must be at least 30 characters long for meaningful evaluation.', 400)
      );
    }

    const startup = await getStartupByIdAndUser(startupId, req.user.id);
    if (!startup) {
      return next(new AppError('Startup not found or unauthorized.', 404));
    }

    // 1. Evaluate pitch via Gemini
    const evaluation = await evaluatePitchWithAI(startup, pitchTranscript.trim(), durationMinutes);

    // 2. Save in pitch_evaluations
    const scores = evaluation.categoryScores || {};
    const saved = await savePitchEvaluation({
      startup_id: startup.id,
      pitch_transcript: pitchTranscript.trim(),
      problem_clarity_score: scores.problemClarity || 0,
      market_opportunity_score: scores.marketOpportunity || 0,
      business_model_score: scores.businessModel || 0,
      defensibility_score: scores.competitiveAdvantage || 0,
      presentation_score: scores.clarityAndStructure || 0,
      overall_score: evaluation.overallScore || 75,
      category_scores: scores,
      pitch_strengths: evaluation.strengths || [],
      pitch_weaknesses: evaluation.weaknesses || [],
      missing_information: evaluation.missingInformation || [],
      improved_pitch: evaluation.improvedPitch || null,
      full_report: evaluation,
      actionable_feedback: {
        storytellingTips: evaluation.storytellingTips || [],
        potentialInvestorQuestions: evaluation.potentialInvestorQuestions || [],
      },
    });

    // 3. Update Readiness Score
    await updateModuleReadinessScore({
      startup_id: startup.id,
      moduleType: 'pitch',
      score: evaluation.overallScore || 75,
    });

    res.status(200).json({
      success: true,
      message: 'Pitch successfully evaluated by AI coach!',
      evaluationId: saved.id,
      evaluation,
    });
  } catch (error) {
    next(error);
  }
};

export const getLatestPitchEvaluation = async (req, res, next) => {
  try {
    const startupId = Number(req.params.startupId);
    const startup = await getStartupByIdAndUser(startupId, req.user.id);
    if (!startup) {
      return next(new AppError('Startup not found or unauthorized.', 404));
    }

    const evaluation = await getLatestPitchEvaluationByStartup(startupId);
    res.status(200).json({
      success: true,
      evaluation,
    });
  } catch (error) {
    next(error);
  }
};

export const getPitchHistory = async (req, res, next) => {
  try {
    const startupId = Number(req.params.startupId);
    const startup = await getStartupByIdAndUser(startupId, req.user.id);
    if (!startup) {
      return next(new AppError('Startup not found or unauthorized.', 404));
    }

    const history = await getPitchHistoryByStartup(startupId);
    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    next(error);
  }
};
