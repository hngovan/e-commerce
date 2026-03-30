const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");
const {
  HTTP_STATUS,
  JWT_ERROR_NAMES,
} = require("../constants/errorCodes.constants");
const { errorResponse } = require("../utils/responseHelper");
const { isBlacklisted } = require("../utils/tokenBlacklist");

/**
 * Middleware to verify JWT access token
 * Expects Authorization header with 'Bearer <token>'
 */
const verifyAccessToken = asyncHandler(async (req, res, next) => {
  // Check if Authorization header exists and starts with 'Bearer'
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    // Extract token from header (remove 'Bearer ' prefix)
    const token = req.headers.authorization.split(" ")[1];

    // Check if token is blacklisted (logged out)
    if (isBlacklisted(token)) {
      return errorResponse(
        res,
        "Token has been invalidated. Please login again.",
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    // Verify token with JWT_SECRET
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        // Handle invalid or expired token
        if (err.name === JWT_ERROR_NAMES.TOKEN_EXPIRED) {
          return errorResponse(
            res,
            "Access token expired",
            HTTP_STATUS.UNAUTHORIZED,
          );
        }
        return errorResponse(
          res,
          "Invalid access token",
          HTTP_STATUS.UNAUTHORIZED,
        );
      }

      // Attach decoded user data to request object
      req.user = decoded;
      next();
    });
  } else {
    // No authorization token provided
    return errorResponse(
      res,
      "Authentication required. Please provide access token.",
      HTTP_STATUS.UNAUTHORIZED,
    );
  }
});

/**
 * Optional: Middleware to verify refresh token
 * Usually used for token refresh endpoints
 */
const verifyRefreshToken = asyncHandler(async (req, res, next) => {
  // Get refresh token from httpOnly cookie
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return errorResponse(
      res,
      "Refresh token not found. Please login again.",
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  // Verify refresh token
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return errorResponse(
        res,
        "Invalid or expired refresh token. Please login again.",
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    req.user = decoded;
    next();
  });
});

/**
 * Optional: Role-based authorization middleware
 * @param {...string} roles - Allowed roles
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return errorResponse(
        res,
        "User not authenticated",
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    // Check if user's role is allowed
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        "Access forbidden. Insufficient permissions.",
        HTTP_STATUS.FORBIDDEN,
      );
    }

    next();
  };
};

/**
 * Middleware to check if user is blocked
 * Use after verifyAccessToken
 */
const checkUserBlocked = asyncHandler(async (req, res, next) => {
  // Get user from database to get latest isBlocked status
  const user = await User.findById(req.user._id);

  if (!user) {
    return errorResponse(res, "User not found", HTTP_STATUS.NOT_FOUND);
  }

  if (user.isBlocked) {
    return errorResponse(
      res,
      "Your account has been blocked. Please contact support.",
      HTTP_STATUS.FORBIDDEN,
    );
  }

  next();
});

module.exports = {
  verifyAccessToken,
  verifyRefreshToken,
  authorizeRoles,
  checkUserBlocked,
};
