const router = require("express").Router();
const category = require("../controllers/category.controller");
const {
  verifyAccessToken,
  authorizeRoles,
} = require("../middlewares/verifyToken");
const { ROLES } = require("../constants/role.constants");
const {
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoryId,
} = require("../validation/categoryValidator");

// ==================== PUBLIC ROUTES ====================
router.get("/", category.getAllCategories);
router.get("/:id", category.getCategory);

// ==================== ADMIN ONLY ROUTES ====================
router.post(
  "/",
  [verifyAccessToken, authorizeRoles(ROLES.ADMIN), validateCreateCategory],
  category.createCategory,
);

router.put(
  "/:id",
  [verifyAccessToken, authorizeRoles(ROLES.ADMIN), validateUpdateCategory],
  category.updateCategory,
);

router.delete(
  "/:id",
  [verifyAccessToken, authorizeRoles(ROLES.ADMIN), validateCategoryId],
  category.deleteCategory,
);

module.exports = router;
