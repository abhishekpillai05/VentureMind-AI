// Centralized error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error('🔥 [Unhandled Error]:', err);

  // Default error format
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const message = err.message || 'Internal Server Error';

  // Handle MySQL errors specifically
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'A record with this unique value (such as email) already exists.',
      error: 'DUPLICATE_ENTRY',
    });
  }

  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      success: false,
      message: 'Database connection failed. Please ensure MySQL server is running and credentials in .env are correct.',
      error: 'DATABASE_OFFLINE',
    });
  }

  if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(500).json({
      success: false,
      message: 'MySQL access denied. Please check your DB_USER and DB_PASSWORD in server/.env.',
      error: 'DATABASE_AUTH_FAILED',
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
