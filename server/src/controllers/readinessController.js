import { getStartupByIdAndUser } from '../models/startupModel.js';
import {
  getReadinessScoreByStartup,
  syncAndRecalculateReadiness,
} from '../models/readinessModel.js';
import { AppError } from '../middleware/errorHandler.js';

export const getStartupReadiness = async (req, res, next) => {
  try {
    const startupId = Number(req.params.startupId);
    const startup = await getStartupByIdAndUser(startupId, req.user.id);
    if (!startup) {
      return next(new AppError('Startup not found or unauthorized.', 404));
    }

    const readiness = await syncAndRecalculateReadiness(startupId);
    const row = await getReadinessScoreByStartup(startupId);

    res.status(200).json({
      success: true,
      startup: {
        id: startup.id,
        name: startup.name,
        industry: startup.industry,
        stage: startup.stage,
      },
      readiness,
      rawScores: {
        validation: row?.validation_score || 0,
        market: row?.market_score || 0,
        financial: row?.financial_score || 0,
        investor: row?.investor_score || 0,
        pitch: row?.pitch_score || 0,
      },
      actionChecklist: row?.action_checklist || [],
    });
  } catch (error) {
    next(error);
  }
};
