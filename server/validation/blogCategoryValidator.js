const { check } = require("express-validator");
const { handleValidationErrors } = require("../utils/validationHelper");

// ==================== VALIDATE CREATE BLOG CATEGORY ====================
const validateCreateBlogCategory = [
  check("title")
    .notEmpty()
    .withMessage("Blog category title is required")
    .isLength({ min: 2 })
    .withMessage("Blog category title must be at least 2 characters")
    .isLength({ max: 100 })
    .withMessage("Blog category title must not exceed 100 characters")
    .trim(),

  handleValidationErrors,
];

// ==================== VALIDATE UPDATE BLOG CATEGORY ====================
const validateUpdateBlogCategory = [
  check("title")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Blog category title must be at least 2 characters")
    .isLength({ max: 100 })
    .withMessage("Blog category title must not exceed 100 characters")
    .trim(),

  handleValidationErrors,
];

// ==================== VALIDATE BLOG CATEGORY ID ====================
const validateBlogCategoryId = [
  check("id")
    .notEmpty()
    .withMessage("Blog category ID is required")
    .isMongoId()
    .withMessage("Invalid blog category ID"),

  handleValidationErrors,
];

module.exports = {
  validateCreateBlogCategory,
  validateUpdateBlogCategory,
  validateBlogCategoryId,
};
