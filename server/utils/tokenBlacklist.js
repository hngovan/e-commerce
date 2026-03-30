// Simple in-memory blacklist (for development)
// For production, use Redis or database
const tokenBlacklist = new Set();

/**
 * Add token to blacklist
 * @param {string} token - Access token to blacklist
 */
const addToBlacklist = (token) => {
  tokenBlacklist.add(token);
};

/**
 * Check if token is blacklisted
 * @param {string} token - Access token to check
 * @returns {boolean} True if token is blacklisted
 */
const isBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

/**
 * Remove expired tokens (optional cleanup)
 * Note: In production, use Redis with TTL
 */
const cleanupBlacklist = () => {
  // This is a simplified version
  // In production, you'd want to remove expired tokens
  tokenBlacklist.clear();
};

module.exports = {
  addToBlacklist,
  isBlacklisted,
  cleanupBlacklist,
};
