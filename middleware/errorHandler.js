/**
 * Centralized error handling middleware.
 * Catches all errors passed via next(err).
 * Never leaks stack traces in production.
 */
const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists.`;
    statusCode = 409;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(422).json({ success: false, message: 'Validation failed', errors });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    message = `Invalid ${err.path}: ${err.value}`;
    statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token. Please log in again.';
    statusCode = 401;
  }
  if (err.name === 'TokenExpiredError') {
    message = 'Token expired. Please log in again.';
    statusCode = 401;
  }

  const response = { success: false, message };

  // Include stack trace only in development
  if (isDev && err.stack) {
    response.stack = err.stack;
  }

  console.error(`[${new Date().toISOString()}] ${statusCode} ${message}`);
  if (isDev) console.error(err.stack);

  res.status(statusCode).json(response);
};

const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

module.exports = { errorHandler, notFound };
