import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { createUser, findUserByEmail, markEmailVerified, updateUserPassword } from '../models/userModel.js';
import {
  createVerification,
  getActiveVerification,
  incrementAttempts,
  markVerificationUsed,
} from '../models/verificationModel.js';
import { sendOTPEmail, sendPasswordResetOTPEmail } from '../services/emailService.js';
import { AppError } from '../middleware/errorHandler.js';

const signToken = (id) => {
  return jwt.sign({ id }, ENV.JWT.SECRET, { expiresIn: ENV.JWT.EXPIRES_IN });
};

// Generate cryptographically secure 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// ─── REGISTER ───
export const register = async (req, res, next) => {
  try {
    const { full_name, email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await findUserByEmail(normalizedEmail);
    if (existing) {
      return next(new AppError('An account with this email already exists.', 409));
    }

    const password_hash = await bcrypt.hash(password, 12);
    const newUser = await createUser({
      full_name: full_name.trim(),
      email: normalizedEmail,
      password_hash,
    });

    // Generate OTP and hash it
    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await createVerification({
      user_id: newUser.id,
      otp_hash: otpHash,
      expires_at: expiresAt,
    });

    // Send OTP email with clear backend diagnostic tracking
    try {
      await sendOTPEmail(normalizedEmail, newUser.full_name, otp);
    } catch (mailErr) {
      console.error(
        `⚠️ Registration: Failed to dispatch email to ${normalizedEmail}: ${mailErr.message}`
      );
    }

    // Issue token even before verification (unverified users are blocked from protected routes)
    const token = signToken(newUser.id);

    res.status(201).json({
      success: true,
      message: 'Account created. Please verify your email with the 6-digit code sent to your inbox.',
      requires_verification: true,
      token,
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
        email_verified: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── VERIFY EMAIL ───
export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return next(new AppError('No account found with this email.', 404));
    }

    if (user.email_verified) {
      return res.status(200).json({
        success: true,
        message: 'Email is already verified.',
        already_verified: true,
      });
    }

    const verification = await getActiveVerification(user.id);
    if (!verification) {
      return next(new AppError('No active verification code found. Please request a new one.', 400));
    }

    // Check max attempts (5)
    if (verification.attempts >= 5) {
      await markVerificationUsed(verification.id);
      return next(new AppError('Too many failed attempts. Please request a new verification code.', 429));
    }

    // Check expiry
    if (new Date(verification.expires_at) < new Date()) {
      await markVerificationUsed(verification.id);
      return next(new AppError('Verification code has expired. Please request a new one.', 410));
    }

    // Increment attempt counter
    await incrementAttempts(verification.id);

    // Verify OTP hash
    const isValid = await bcrypt.compare(otp.trim(), verification.otp_hash);
    if (!isValid) {
      const remaining = 5 - (verification.attempts + 1);
      return next(
        new AppError(
          `Invalid verification code. ${
            remaining > 0
              ? `${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
              : 'No attempts remaining. Please request a new code.'
          }`,
          400
        )
      );
    }

    // Mark as used and update user record to verified
    await markVerificationUsed(verification.id);
    await markEmailVerified(user.id);

    const token = signToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        email_verified: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── RESEND OTP ───
export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return next(new AppError('No account found with this email.', 404));
    }

    if (user.email_verified) {
      return res.status(200).json({ success: true, message: 'Email is already verified.' });
    }

    // Rate limit: check last OTP created_at for 60s cooldown
    const existing = await getActiveVerification(user.id);
    if (existing) {
      const elapsed = Date.now() - new Date(existing.created_at).getTime();
      if (elapsed < 60000) {
        const wait = Math.ceil((60000 - elapsed) / 1000);
        return next(new AppError(`Please wait ${wait} seconds before requesting a new code.`, 429));
      }
    }

    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await createVerification({
      user_id: user.id,
      otp_hash: otpHash,
      expires_at: expiresAt,
    });

    try {
      await sendOTPEmail(normalizedEmail, user.full_name, otp);
    } catch (mailErr) {
      return next(
        new AppError(`Unable to deliver verification email: ${mailErr.message}`, 500)
      );
    }

    res.status(200).json({
      success: true,
      message: 'A fresh verification code has been dispatched to your email.',
    });
  } catch (error) {
    next(error);
  }
};

// ─── LOGIN ───
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return next(new AppError('Invalid email or password.', 401));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password.', 401));
    }

    // If user is unverified, make sure they have an active OTP or dispatch a new one
    if (!user.email_verified) {
      const active = await getActiveVerification(user.id);
      if (!active || new Date(active.expires_at) < new Date()) {
        const otp = generateOTP();
        const otpHash = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await createVerification({
          user_id: user.id,
          otp_hash: otpHash,
          expires_at: expiresAt,
        });

        try {
          await sendOTPEmail(normalizedEmail, user.full_name, otp);
        } catch (mailErr) {
          console.error(
            `⚠️ Login: Failed to dispatch OTP to unverified user ${normalizedEmail}: ${mailErr.message}`
          );
        }
      }
    }

    const token = signToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      requires_verification: !user.email_verified,
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        email_verified: !!user.email_verified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET ME ───
export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// ─── FORGOT PASSWORD (REQUEST OTP) ───
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return next(new AppError('No account found with this email address.', 404));
    }

    // Rate limit check: 60-second cooldown
    const existing = await getActiveVerification(user.id);
    if (existing) {
      const elapsed = Date.now() - new Date(existing.created_at).getTime();
      if (elapsed < 60000) {
        const wait = Math.ceil((60000 - elapsed) / 1000);
        return next(new AppError(`Please wait ${wait} seconds before requesting a new code.`, 429));
      }
    }

    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await createVerification({
      user_id: user.id,
      otp_hash: otpHash,
      expires_at: expiresAt,
    });

    try {
      await sendPasswordResetOTPEmail(normalizedEmail, user.full_name, otp);
    } catch (mailErr) {
      return next(new AppError(`Unable to deliver password reset email: ${mailErr.message}`, 500));
    }

    res.status(200).json({
      success: true,
      message: 'A 6-digit password reset code has been dispatched to your email.',
      email: normalizedEmail,
    });
  } catch (error) {
    next(error);
  }
};

// ─── RESET PASSWORD (VERIFY OTP & UPDATE PASSWORD) ───
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, new_password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return next(new AppError('No account found with this email address.', 404));
    }

    const verification = await getActiveVerification(user.id);
    if (!verification) {
      return next(new AppError('No active password reset code found. Please request a new one.', 400));
    }

    // Check max attempts (5)
    if (verification.attempts >= 5) {
      await markVerificationUsed(verification.id);
      return next(new AppError('Too many failed attempts. Please request a new verification code.', 429));
    }

    // Check expiry
    if (new Date(verification.expires_at) < new Date()) {
      await markVerificationUsed(verification.id);
      return next(new AppError('Verification code has expired. Please request a new code.', 410));
    }

    // Increment attempt counter
    await incrementAttempts(verification.id);

    // Verify OTP
    const isValid = await bcrypt.compare(otp.trim(), verification.otp_hash);
    if (!isValid) {
      const remaining = 5 - (verification.attempts + 1);
      return next(
        new AppError(
          `Invalid verification code. ${
            remaining > 0
              ? `${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
              : 'No attempts remaining. Please request a new code.'
          }`,
          400
        )
      );
    }

    // Mark verification as used
    await markVerificationUsed(verification.id);

    // Hash new password and update
    const password_hash = await bcrypt.hash(new_password, 12);
    await updateUserPassword(user.id, password_hash);

    // If user was previously unverified, mark as verified since they proven ownership of this inbox
    if (!user.email_verified) {
      await markEmailVerified(user.id);
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now sign in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};
