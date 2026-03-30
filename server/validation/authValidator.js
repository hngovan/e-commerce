const { check } = require("express-validator");
const {
  handleValidationErrors,
  commonValidations,
} = require("../utils/validationHelper");

// ==================== VALIDATE REGISTER ====================
const validateRegister = [
  commonValidations.name("firstName"),
  commonValidations.name("lastName"),
  commonValidations.email,
  commonValidations.password,
  commonValidations.mobile,
  handleValidationErrors,
];

// ==================== VALIDATE LOGIN ====================
const validateLogin = [
  commonValidations.email,
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 1 })
    .withMessage("Password cannot be empty"),
  handleValidationErrors,
];

// ==================== VALIDATE FORGOT PASSWORD ====================
const validateForgotPassword = [
  commonValidations.email,
  handleValidationErrors,
];

// ==================== VALIDATE RESET PASSWORD ====================
const validateResetPassword = [
  commonValidations.password,
  commonValidations.confirmPassword,
  handleValidationErrors,
];

// ==================== VALIDATE UPDATE PROFILE ====================
const validateUpdateProfile = [
  commonValidations.nameOptional("firstName"),
  commonValidations.nameOptional("lastName"),
  commonValidations.mobileOptional,
  handleValidationErrors,
];

// ==================== VALIDATE UPDATE USER BY ADMIN ====================
const validateUpdateUserByAdmin = [
  commonValidations.nameOptional("firstName"),
  commonValidations.nameOptional("lastName"),
  commonValidations.mobileOptional,
  check("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Role must be either 'user' or 'admin'"),
  check("isBlocked")
    .optional()
    .isBoolean()
    .withMessage("isBlocked must be a boolean value"),
  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateUpdateProfile,
  validateUpdateUserByAdmin,
};
