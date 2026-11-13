import bcrypt from 'bcryptjs';
import {
  findUserById,
  findUserWithPasswordById,
  updateUserProfile,
  updateUserPassword,
  getUserPreferences,
  upsertUserPreferences,
  deleteUserById,
} from '../models/userModel.js';
import { AppError } from '../middleware/errorHandler.js';

// ─── GET PROFILE & SETTINGS ───
export const getProfile = async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return next(new AppError('User not found.', 404));
    }
    const preferences = await getUserPreferences(req.user.id);

    res.status(200).json({
      success: true,
      user,
      preferences,
    });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE PROFILE ───
export const updateProfile = async (req, res, next) => {
  try {
    const { full_name, bio, headline, phone, location, avatar_url } = req.body;

    const updatedUser = await updateUserProfile(req.user.id, {
      full_name: full_name.trim(),
      bio: bio ? bio.trim() : null,
      headline: headline ? headline.trim() : null,
      phone: phone ? phone.trim() : null,
      location: location ? location.trim() : null,
      avatar_url: avatar_url || null,
    });

    res.status(200).json({
      success: true,
      message: 'Founder profile updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET PREFERENCES ───
export const getPreferences = async (req, res, next) => {
  try {
    const preferences = await getUserPreferences(req.user.id);
    res.status(200).json({
      success: true,
      preferences,
    });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE PREFERENCES ───
export const updatePreferences = async (req, res, next) => {
  try {
    const current = await getUserPreferences(req.user.id);
    const merged = { ...current, ...req.body };

    // Auto-sync currency symbol if currency changed
    if (req.body.currency) {
      const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
      merged.currency_symbol = symbols[req.body.currency] || '₹';
    }

    const updated = await upsertUserPreferences(req.user.id, merged);

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully.',
      preferences: updated,
    });
  } catch (error) {
    next(error);
  }
};

// ─── CHANGE PASSWORD ───
export const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    const userWithPassword = await findUserWithPasswordById(req.user.id);
    if (!userWithPassword) {
      return next(new AppError('User not found.', 404));
    }

    // Verify current password with bcrypt
    const isMatch = await bcrypt.compare(current_password, userWithPassword.password_hash);
    if (!isMatch) {
      return next(new AppError('The current password you provided is incorrect.', 400));
    }

    // Check if new password is same as existing
    const isSame = await bcrypt.compare(new_password, userWithPassword.password_hash);
    if (isSame) {
      return next(new AppError('Your new password must be different from your existing password.', 400));
    }

    // Hash new password using bcrypt 12 rounds
    const newHash = await bcrypt.hash(new_password, 12);
    await updateUserPassword(req.user.id, newHash);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Your account is secured.',
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE ACCOUNT ───
export const deleteAccount = async (req, res, next) => {
  try {
    const { password, confirmation_text } = req.body;

    if (confirmation_text !== 'DELETE') {
      return next(new AppError('Please enter exact confirmation "DELETE" to proceed.', 400));
    }

    const userWithPassword = await findUserWithPasswordById(req.user.id);
    if (!userWithPassword) {
      return next(new AppError('User not found.', 404));
    }

    // Verify password before destructive action
    const isMatch = await bcrypt.compare(password, userWithPassword.password_hash);
    if (!isMatch) {
      return next(new AppError('Incorrect password. Account deletion request declined.', 400));
    }

    // Delete user (cascades to all startups, simulations, validations, and preferences)
    await deleteUserById(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Your account and all associated startup dossiers have been permanently deleted.',
    });
  } catch (error) {
    next(error);
  }
};
