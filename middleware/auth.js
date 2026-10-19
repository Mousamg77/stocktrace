const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const { error } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Verifies JWT from HttpOnly cookie or Authorization header.
 * Attaches the user document to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Try cookie first (production-secure approach)
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // 2. Fallback to Authorization header (useful for testing/mobile)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return error(res, 'Authentication required. Please log in.', 401);
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    return error(res, 'Invalid or expired token. Please log in again.', 401);
  }

  const user = await User.findById(decoded.id).select('-password');
  if (!user || !user.isActive) {
    return error(res, 'User not found or account is deactivated.', 401);
  }

  req.user = user;
  next();
});

/**
 * Role-based access control middleware.
 * Call after protect: requireRole('admin', 'manager')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Authentication required.', 401);
    }
    if (!roles.includes(req.user.role)) {
      return error(
        res,
        `Access denied. Required role: ${roles.join(' or ')}.`,
        403
      );
    }
    next();
  };
};

module.exports = { protect, requireRole };
