import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { AppError } from './errorHandler.js';
import { findUserById } from '../models/userModel.js';

export const requireAuth = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Authentication required. No token provided.', 401));
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, ENV.JWT.SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return next(new AppError('Your session has expired. Please log in again.', 401));
      }
      return next(new AppError('Invalid authentication token.', 401));
    }

    // Fetch user from DB to confirm user still exists
    const user = await findUserById(decoded.id);
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // Attach user to req without password
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireVerifiedEmail = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required.', 401));
  }
  if (!req.user.email_verified) {
    return next(
      new AppError('Please verify your email address to access this feature.', 403)
    );
  }
  next();
};
