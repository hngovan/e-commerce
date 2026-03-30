const { check } = require("express-validator");
const { handleValidationErrors } = require("../utils/validationHelper");
const { CATEGORY_VALIDATION } = require("../constants/category.constants");

// ==================== VALIDATE CREATE CATEGORY ====================
const validateCreateCategory = [
  check("name")
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: CATEGORY_VALIDATION.NAME_MIN_LENGTH })
    .withMessage(`Category name must be at least ${CATEGORY_VALIDATION.NAME_MIN_LENGTH} characters`)
    .isLength({ max: CATEGORY_VALIDATION.NAME_MAX_LENGTH })
    .withMessage(`Category name must not exceed ${CATEGORY_VALIDATION.NAME_MAX_LENGTH} characters`)
    .trim(),

  check("description")
    .optional()
    .isLength({ max: CATEGORY_VALIDATION.DESCRIPTION_MAX_LENGTH })
    .withMessage(`Description must not exceed ${CATEGORY_VALIDATION.DESCRIPTION_MAX_LENGTH} characters`)
    .trim(),

  check("image")
    .optional()
    .isURL()
    .withMessage("Image must be a valid URL")
    .trim(),

  handleValidationErrors,
];

// ==================== VALIDATE UPDATE CATEGORY ====================
const validateUpdateCategory = [
  check("name")
    .optional()
    .isLength({ min: CATEGORY_VALIDATION.NAME_MIN_LENGTH })
    .withMessage(`Category name must be at least ${CATEGORY_VALIDATION.NAME_MIN_LENGTH} characters`)
    .isLength({ max: CATEGORY_VALIDATION.NAME_MAX_LENGTH })
    .withMessage(`Category name must not exceed ${CATEGORY_VALIDATION.NAME_MAX_LENGTH} characters`)
    .trim(),

  check("description")
    .optional()
    .isLength({ max: CATEGORY_VALIDATION.DESCRIPTION_MAX_LENGTH })
    .withMessage(`Description must not exceed ${CATEGORY_VALIDATION.DESCRIPTION_MAX_LENGTH} characters`)
    .trim(),

  check("image")
    .optional()
    .isURL()
    .withMessage("Image must be a valid URL")
    .trim(),

  check("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  handleValidationErrors,
];

// ==================== VALIDATE CATEGORY ID ====================
const validateCategoryId = [
  check("id")
    .notEmpty()
    .withMessage("Category ID is required")
    .isMongoId()
    .withMessage("Invalid category ID"),

  handleValidationErrors,
];

module.exports = {
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoryId,
  CATEGORY_VALIDATION,
};
