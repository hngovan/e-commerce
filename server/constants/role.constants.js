/**
 * User roles constants
 */
const ROLES = {
  USER: "user",
  ADMIN: "admin",
};

/**
 * Check if user has admin role
 * @param {Object} user - User object
 * @returns {boolean} True if user is admin
 */
const isAdmin = (user) => {
  return user?.role === ROLES.ADMIN;
};

/**
 * Check if user has user role
 * @param {Object} user - User object
 * @returns {boolean} True if user is regular user
 */
const isUser = (user) => {
  return user?.role === ROLES.USER;
};

/**
 * Check if a role is valid
 * @param {string} role - Role to validate
 * @returns {boolean} True if role is valid
 */
const isValidRole = (role) => {
  return ALL_ROLES.includes(role);
};

/**
 * Role hierarchy (for permission checking)
 */
const ROLE_HIERARCHY = {
  [ROLES.USER]: 1,
  [ROLES.ADMIN]: 2,
};

module.exports = {
  ROLES,
  isAdmin,
  isUser,
  isValidRole,
  ROLE_HIERARCHY,
};
