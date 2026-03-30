const { check } = require("express-validator");
const { handleValidationErrors } = require("../utils/validationHelper");
const {
  ALLOWED_COLORS,
  PRODUCT_VALIDATION,
} = require("../constants/product.constants");

// ==================== VALIDATE CREATE PRODUCT ====================
const validateCreateProduct = [
  check("title")
    .notEmpty()
    .withMessage("Product title is required")
    .isLength({ min: PRODUCT_VALIDATION.TITLE_MIN_LENGTH })
    .withMessage(
      `Title must be at least ${PRODUCT_VALIDATION.TITLE_MIN_LENGTH} characters`,
    )
    .isLength({ max: PRODUCT_VALIDATION.TITLE_MAX_LENGTH })
    .withMessage(
      `Title must not exceed ${PRODUCT_VALIDATION.TITLE_MAX_LENGTH} characters`,
    )
    .trim(),

  check("description")
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ min: PRODUCT_VALIDATION.DESCRIPTION_MIN_LENGTH })
    .withMessage(
      `Description must be at least ${PRODUCT_VALIDATION.DESCRIPTION_MIN_LENGTH} characters`,
    )
    .isLength({ max: PRODUCT_VALIDATION.DESCRIPTION_MAX_LENGTH })
    .withMessage(
      `Description must not exceed ${PRODUCT_VALIDATION.DESCRIPTION_MAX_LENGTH} characters`,
    )
    .trim(),

  check("brand")
    .notEmpty()
    .withMessage("Product brand is required")
    .isLength({ min: PRODUCT_VALIDATION.BRAND_MIN_LENGTH })
    .withMessage(
      `Brand must be at least ${PRODUCT_VALIDATION.BRAND_MIN_LENGTH} characters`,
    )
    .isLength({ max: PRODUCT_VALIDATION.BRAND_MAX_LENGTH })
    .withMessage(
      `Brand must not exceed ${PRODUCT_VALIDATION.BRAND_MAX_LENGTH} characters`,
    )
    .trim(),

  check("price")
    .notEmpty()
    .withMessage("Product price is required")
    .isNumeric()
    .withMessage("Price must be a number")
    .custom((value) => value >= PRODUCT_VALIDATION.PRICE_MIN)
    .withMessage(
      `Price must be greater than or equal to ${PRODUCT_VALIDATION.PRICE_MIN}`,
    ),

  check("category")
    .notEmpty()
    .withMessage("Category ID is required")
    .isMongoId()
    .withMessage("Invalid category ID"),

  check("quantity")
    .optional()
    .isNumeric()
    .withMessage("Quantity must be a number")
    .custom((value) => value >= PRODUCT_VALIDATION.QUANTITY_MIN)
    .withMessage(
      `Quantity must be greater than or equal to ${PRODUCT_VALIDATION.QUANTITY_MIN}`,
    ),

  check("color")
    .optional()
    .isIn(ALLOWED_COLORS)
    .withMessage(`Color must be one of: ${ALLOWED_COLORS.join(", ")}`),

  check("images").optional().isArray().withMessage("Images must be an array"),

  handleValidationErrors,
];

// ==================== VALIDATE UPDATE PRODUCT ====================
const validateUpdateProduct = [
  check("title")
    .optional()
    .isLength({ min: PRODUCT_VALIDATION.TITLE_MIN_LENGTH })
    .withMessage(
      `Title must be at least ${PRODUCT_VALIDATION.TITLE_MIN_LENGTH} characters`,
    )
    .isLength({ max: PRODUCT_VALIDATION.TITLE_MAX_LENGTH })
    .withMessage(
      `Title must not exceed ${PRODUCT_VALIDATION.TITLE_MAX_LENGTH} characters`,
    )
    .trim(),

  check("description")
    .optional()
    .isLength({ min: PRODUCT_VALIDATION.DESCRIPTION_MIN_LENGTH })
    .withMessage(
      `Description must be at least ${PRODUCT_VALIDATION.DESCRIPTION_MIN_LENGTH} characters`,
    )
    .isLength({ max: PRODUCT_VALIDATION.DESCRIPTION_MAX_LENGTH })
    .withMessage(
      `Description must not exceed ${PRODUCT_VALIDATION.DESCRIPTION_MAX_LENGTH} characters`,
    )
    .trim(),

  check("brand")
    .optional()
    .isLength({ min: PRODUCT_VALIDATION.BRAND_MIN_LENGTH })
    .withMessage(
      `Brand must be at least ${PRODUCT_VALIDATION.BRAND_MIN_LENGTH} characters`,
    )
    .isLength({ max: PRODUCT_VALIDATION.BRAND_MAX_LENGTH })
    .withMessage(
      `Brand must not exceed ${PRODUCT_VALIDATION.BRAND_MAX_LENGTH} characters`,
    )
    .trim(),

  check("price")
    .optional()
    .isNumeric()
    .withMessage("Price must be a number")
    .custom((value) => value >= PRODUCT_VALIDATION.PRICE_MIN)
    .withMessage(
      `Price must be greater than or equal to ${PRODUCT_VALIDATION.PRICE_MIN}`,
    ),

  check("category").optional().isMongoId().withMessage("Invalid category ID"),

  check("quantity")
    .optional()
    .isNumeric()
    .withMessage("Quantity must be a number")
    .custom((value) => value >= PRODUCT_VALIDATION.QUANTITY_MIN)
    .withMessage(
      `Quantity must be greater than or equal to ${PRODUCT_VALIDATION.QUANTITY_MIN}`,
    ),

  check("color")
    .optional()
    .isIn(ALLOWED_COLORS)
    .withMessage(`Color must be one of: ${ALLOWED_COLORS.join(", ")}`),

  handleValidationErrors,
];

// ==================== VALIDATE PRODUCT ID ====================
const validateProductId = [
  check("pid")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID"),

  handleValidationErrors,
];

// ==================== VALIDATE RATING ====================
const validateRating = [
  check("star")
    .notEmpty()
    .withMessage("Rating star is required")
    .isNumeric()
    .withMessage("Star must be a number")
    .isInt({ min: 1, max: 5 })
    .withMessage("Star rating must be between 1 and 5"),

  check("comment")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Comment must not exceed 500 characters")
    .trim(),

  handleValidationErrors,
];

module.exports = {
  validateCreateProduct,
  validateUpdateProduct,
  validateProductId,
  validateRating,
};
