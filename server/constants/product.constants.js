/**
 * Product colors
 */
const PRODUCT_COLORS = {
  BLACK: "Black",
  BROWN: "Brown",
  RED: "Red",
};

/**
 * Allowed colors for products
 */
const ALLOWED_COLORS = Object.values(PRODUCT_COLORS);

/**
 * Product validation rules
 */
const PRODUCT_VALIDATION = {
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 5000,
  BRAND_MIN_LENGTH: 2,
  BRAND_MAX_LENGTH: 100,
  PRICE_MIN: 0,
  QUANTITY_MIN: 0,
  SOLD_MIN: 0,
  RATING_MIN: 1,
  RATING_MAX: 5,
};

module.exports = {
  PRODUCT_COLORS,
  ALLOWED_COLORS,
  PRODUCT_VALIDATION,
};
