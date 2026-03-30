const { check, validationResult } = require("express-validator");
const { validationErrorResponse } = require("./responseHelper");

/**
 * Middleware to handle validation errors
 * Reusable for all validation middlewares
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return validationErrorResponse(res, formattedErrors);
  }
  next();
};

/**
 * Common validation rules
 */
const commonValidations = {
  // Name validation (first name, last name) - REQUIRED for register
  name: (field) =>
    check(field)
      .notEmpty()
      .withMessage(`${field} is required`)
      .isLength({ min: 2 })
      .withMessage(`${field} must be at least 2 characters`)
      .isLength({ max: 50 })
      .withMessage(`${field} must not exceed 50 characters`)
      .matches(/^[\p{L} ]+$/u)
      .withMessage(`${field} must contain only letters`)
      .trim(),

  // Name validation for UPDATE (optional)
  nameOptional: (field) =>
    check(field)
      .optional()
      .isLength({ min: 2 })
      .withMessage(`${field} must be at least 2 characters`)
      .isLength({ max: 50 })
      .withMessage(`${field} must not exceed 50 characters`)
      .matches(/^[\p{L} ]+$/u)
      .withMessage(`${field} must contain only letters`)
      .trim(),

  // Email validation
  email: check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail()
    .trim(),

  // Password validation
  password: check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .isLength({ max: 100 })
    .withMessage("Password must not exceed 100 characters")
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage("Password must contain at least one letter and one number"),

  // Mobile validation - REQUIRED for register
  mobile: check("mobile")
    .notEmpty()
    .withMessage("Mobile number is required")
    .matches(/^(0[3-9])+([0-9]{8})$/)
    .withMessage(
      "Invalid Vietnamese phone number (must start with 03-09 and have 10 digits)",
    )
    .trim(),

  // Mobile validation for UPDATE (optional)
  mobileOptional: check("mobile")
    .optional()
    .matches(/^(0[3-9])+([0-9]{8})$/)
    .withMessage(
      "Invalid Vietnamese phone number (must start with 03-09 and have 10 digits)",
    )
    .trim(),

  // Confirm password validation
  confirmPassword: check("confirmPassword")
    .notEmpty()
    .withMessage("Please confirm your password")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
};

module.exports = {
  handleValidationErrors,
  commonValidations,
};
