import { getStartupByIdAndUser } from '../models/startupModel.js';
import {
  saveValidationRecord,
  getLatestValidationByStartup,
  getValidationHistoryByStartup,
  getValidationByIdAndStartup,
} from '../models/validationModel.js';
import { upsertReadinessScore } from '../models/readinessModel.js';
import { validateStartupIdeaWithAI } from '../services/geminiService.js';
import { AppError } from '../middleware/errorHandler.js';

export const analyzeStartupIdea = async (req, res, next) => {
  try {
    const startupId = Number(req.params.startupId);
    if (!startupId || isNaN(startupId)) {
      return next(new AppError('Invalid startup ID provided.', 400));
    }

    // 1. Ownership & existence check
    const startup = await getStartupByIdAndUser(startupId, req.user.id);
    if (!startup) {
      return next(
        new AppError('Startup not found or you do not have permission to analyze it.', 404)
      );
    }

    // 2. Validate with Gemini AI
    const aiResult = await validateStartupIdeaWithAI(startup);

    // 3. Save into MySQL
    const saved = await saveValidationRecord({
      startup_id: startup.id,
      full_report: aiResult,
      overall_score: aiResult.overallScore,
      verdict: aiResult.verdict,
      dimension_scores: aiResult.scores,
      problem_solution_fit: aiResult.problemSolutionAnalysis,
      swot_analysis: aiResult.swot,
      target_audience: aiResult.targetAudienceAnalysis,
      recommendations: aiResult.recommendations,
    });

    // 4. Update readiness_scores
    await upsertReadinessScore({
      startup_id: startup.id,
      overall_score: aiResult.overallScore,
      validation_score: aiResult.overallScore,
      action_checklist: aiResult.nextSteps,
    });

    res.status(200).json({
      success: true,
      message: 'Startup idea successfully analyzed and validated by AI!',
      validation: {
        id: saved.id,
        startup_id: startup.id,
        overall_score: aiResult.overallScore,
        verdict: aiResult.verdict,
        dimension_scores: aiResult.scores,
        full_report: aiResult,
        created_at: saved.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLatestValidation = async (req, res, next) => {
  try {
    const startupId = Number(req.params.startupId);
    if (!startupId || isNaN(startupId)) {
      return next(new AppError('Invalid startup ID provided.', 400));
    }

    // Ownership check
    const startup = await getStartupByIdAndUser(startupId, req.user.id);
    if (!startup) {
      return next(
        new AppError('Startup not found or you do not have permission to view it.', 404)
      );
    }

    const validation = await getLatestValidationByStartup(startupId);

    res.status(200).json({
      success: true,
      startup: {
        id: startup.id,
        name: startup.name,
        industry: startup.industry,
        stage: startup.stage,
      },
      validation,
    });
  } catch (error) {
    next(error);
  }
};

export const getValidationHistory = async (req, res, next) => {
  try {
    const startupId = Number(req.params.startupId);
    if (!startupId || isNaN(startupId)) {
      return next(new AppError('Invalid startup ID provided.', 400));
    }

    // Ownership check
    const startup = await getStartupByIdAndUser(startupId, req.user.id);
    if (!startup) {
      return next(
        new AppError('Startup not found or you do not have permission to view its history.', 404)
      );
    }

    const history = await getValidationHistoryByStartup(startupId);

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    next(error);
  }
};

export const getValidationById = async (req, res, next) => {
  try {
    const startupId = Number(req.params.startupId);
    const validationId = Number(req.params.validationId);

    if (!startupId || !validationId || isNaN(startupId) || isNaN(validationId)) {
      return next(new AppError('Invalid startup or validation ID provided.', 400));
    }

    // Ownership check
    const startup = await getStartupByIdAndUser(startupId, req.user.id);
    if (!startup) {
      return next(
        new AppError('Startup not found or you do not have permission to view it.', 404)
      );
    }

    const validation = await getValidationByIdAndStartup(validationId, startupId);
    if (!validation) {
      return next(new AppError('Validation report not found for this startup.', 404));
    }

    res.status(200).json({
      success: true,
      validation,
    });
  } catch (error) {
    next(error);
  }
};
