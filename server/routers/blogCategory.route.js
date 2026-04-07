const router = require("express").Router();
const { ROLES } = require("../constants/role.constants");
const blogCategory = require("../controllers/blogCategory.controller");
const {
  verifyAccessToken,
  authorizeRoles,
} = require("../middlewares/verifyToken");
const {
  validateCreateBlogCategory,
  validateUpdateBlogCategory,
  validateBlogCategoryId,
} = require("../validation/blogCategoryValidator");

// ==================== PUBLIC ROUTES ====================
router.get("/", blogCategory.getAllCategories);
router.get("/:id", blogCategory.getCategory);

// ==================== ADMIN ONLY ROUTES ====================
router.post(
  "/",
  [verifyAccessToken, authorizeRoles(ROLES.ADMIN), validateCreateBlogCategory],
  blogCategory.createCategory,
);

router.put(
  "/:id",
  [
    verifyAccessToken,
    authorizeRoles(ROLES.ADMIN),
    validateUpdateBlogCategory,
    validateBlogCategoryId,
  ],
  blogCategory.updateCategory,
);

router.delete(
  "/:id",
  [verifyAccessToken, authorizeRoles(ROLES.ADMIN), validateBlogCategoryId],
  blogCategory.deleteCategory,
);

module.exports = router;
