const { validationResult } = require('express-validator');
const { error } = require('../utils/response');

/**
 * Runs after express-validator chains.
 * Returns 422 with structured error list if validation fails.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return error(res, 'Validation failed', 422, formatted);
  }
  next();
};

module.exports = validate;
