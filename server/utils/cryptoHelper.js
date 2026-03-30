const crypto = require("crypto");

/**
 * Hash a token using SHA256
 * @param {string} token - Raw token to hash
 * @returns {string} Hashed token
 */
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Generate a random reset token
 * @returns {string} Random token
 */
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

module.exports = {
  hashToken,
  generateRandomToken,
};
