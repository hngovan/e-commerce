const router = require("express").Router();
const { ROLES } = require("../constants/role.constants");
const user = require("../controllers/user.controller");
const {
  verifyAccessToken,
  verifyRefreshToken,
  authorizeRoles,
  checkUserBlocked,
} = require("../middlewares/verifyToken");
const {
  validateLogin,
  validateRegister,
  validateResetPassword,
  validateUpdateProfile,
  validateUpdateUserByAdmin,
} = require("../validation/authValidator");

// ==================== PUBLIC ROUTES ====================
router.post("/register", validateRegister, user.register);
router.post("/login", validateLogin, user.login);
router.post("/forgot-password", user.forgotPassword);
router.post(
  "/reset-password/:token",
  validateResetPassword,
  user.resetPassword,
);
router.post("/logout", user.logout);

// ==================== PROTECTED ROUTES ====================
router.post("/refresh-token", verifyRefreshToken, user.refreshToken);
router.get("/current", [verifyAccessToken, checkUserBlocked], user.getCurrent);
router.put(
  "/profile",
  [verifyAccessToken, checkUserBlocked, validateUpdateProfile],
  user.updateUser,
);

// ==================== ADMIN ONLY ====================
router.get(
  "/all",
  [verifyAccessToken, authorizeRoles(ROLES.ADMIN)],
  user.getAllUsers,
);
router.delete(
  "/:id",
  [verifyAccessToken, authorizeRoles(ROLES.ADMIN)],
  user.deleteUser,
);
router.put(
  "/updateUserByAdmin/:uid",
  [verifyAccessToken, authorizeRoles(ROLES.ADMIN), validateUpdateUserByAdmin],
  user.updateUserByAdmin,
);

module.exports = router;
