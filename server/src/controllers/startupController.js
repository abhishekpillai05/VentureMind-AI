import {
  createStartup,
  getStartupsByUserId,
  getStartupByIdAndUser,
  updateStartupByIdAndUser,
  deleteStartupByIdAndUser,
} from '../models/startupModel.js';
import { AppError } from '../middleware/errorHandler.js';

export const getUserStartups = async (req, res, next) => {
  try {
    const startups = await getStartupsByUserId(req.user.id);
    res.status(200).json({
      success: true,
      count: startups.length,
      startups,
    });
  } catch (error) {
    next(error);
  }
};

export const createNewStartup = async (req, res, next) => {
  try {
    const {
      name,
      tagline,
      industry,
      stage,
      target_customer,
      problem_statement,
      solution_statement,
      revenue_model,
      pitch_summary,
    } = req.body;

    const startup = await createStartup({
      user_id: req.user.id,
      name,
      tagline: tagline || null,
      industry,
      stage: stage || 'Idea',
      target_customer,
      problem_statement,
      solution_statement,
      revenue_model: revenue_model || 'SaaS Subscription',
      pitch_summary: pitch_summary || null,
    });

    res.status(201).json({
      success: true,
      message: 'Startup registered successfully!',
      startup,
    });
  } catch (error) {
    next(error);
  }
};

export const getSingleStartup = async (req, res, next) => {
  try {
    const startupId = Number(req.params.id);
    if (!startupId || isNaN(startupId)) {
      return next(new AppError('Invalid startup ID provided.', 400));
    }

    // User ownership check
    const startup = await getStartupByIdAndUser(startupId, req.user.id);

    if (!startup) {
      return next(
        new AppError('Startup not found or you do not have permission to access it.', 404)
      );
    }

    res.status(200).json({
      success: true,
      startup,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStartup = async (req, res, next) => {
  try {
    const startupId = Number(req.params.id);
    if (!startupId || isNaN(startupId)) {
      return next(new AppError('Invalid startup ID provided.', 400));
    }

    const {
      name,
      tagline,
      industry,
      stage,
      target_customer,
      problem_statement,
      solution_statement,
      revenue_model,
      pitch_summary,
    } = req.body;

    const updatedStartup = await updateStartupByIdAndUser(startupId, req.user.id, {
      name,
      tagline: tagline || null,
      industry,
      stage: stage || 'Idea',
      target_customer,
      problem_statement,
      solution_statement,
      revenue_model: revenue_model || 'SaaS Subscription',
      pitch_summary: pitch_summary || null,
    });

    if (!updatedStartup) {
      return next(
        new AppError('Startup not found or you do not have permission to modify it.', 404)
      );
    }

    res.status(200).json({
      success: true,
      message: 'Startup profile updated successfully!',
      startup: updatedStartup,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStartup = async (req, res, next) => {
  try {
    const startupId = Number(req.params.id);
    if (!startupId || isNaN(startupId)) {
      return next(new AppError('Invalid startup ID provided.', 400));
    }

    const deleted = await deleteStartupByIdAndUser(startupId, req.user.id);

    if (!deleted) {
      return next(
        new AppError('Startup not found or you do not have permission to delete it.', 404)
      );
    }

    res.status(200).json({
      success: true,
      message: 'Startup deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
