const router = require("express").Router();
const product = require("../controllers/product.controller");
const { verifyAccessToken, authorizeRoles } = require("../middlewares/verifyToken");
const { ROLES } = require("../constants/role.constants");
const {
  validateCreateProduct,
  validateUpdateProduct,
  validateProductId,
  validateRating,
} = require("../validation/productValidator");

// ==================== PUBLIC ROUTES ====================
router.get("/", product.getAllProducts);
router.get("/search", product.searchProducts);
router.get("/:id", product.getProduct);

// ==================== PROTECTED ROUTES ====================
router.post(
  "/rating/:pid",
  [verifyAccessToken, validateRating],
  product.addRating,
);

// ==================== ADMIN ONLY ROUTES ====================
router.post(
  "/",
  [verifyAccessToken, authorizeRoles(ROLES.ADMIN), validateCreateProduct],
  product.createProduct,
);

router.put(
  "/:pid",
  [verifyAccessToken, authorizeRoles(ROLES.ADMIN), validateUpdateProduct],
  product.updateProduct,
);

router.delete(
  "/:pid",
  [verifyAccessToken, authorizeRoles(ROLES.ADMIN), validateProductId],
  product.deleteProduct,
);

module.exports = router;
