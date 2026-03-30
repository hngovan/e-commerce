const { errorResponse } = require("../utils/responseHelper");
const {
  MONGO_ERROR_CODES,
  MONGOOSE_ERROR_NAMES,
  HTTP_STATUS,
  JWT_ERROR_NAMES,
} = require("../constants/errorCodes.constants");

/**
 * Middleware to handle non-existent routes (404 Not Found)
 */
const notFound = (req, _res, next) => {
  const error = new Error(`🔍 Not Found - ${req.method} ${req.originalUrl}`);
  error.status = HTTP_STATUS.NOT_FOUND;
  next(error);
};

/**
 * Handle specific types of errors
 */
const handleMongooseError = (err) => {
  // Handle duplicate key error (MongoDB)
  if (err.code === MONGO_ERROR_CODES.DUPLICATE_KEY) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists: ${err.keyValue[field]}`;
    return {
      status: HTTP_STATUS.CONFLICT,
      message: `${message}`,
      errors: [{ field, message }],
    };
  }

  // Handle validation error (Mongoose)
  if (err.name === MONGOOSE_ERROR_NAMES.VALIDATION_ERROR) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return {
      status: HTTP_STATUS.BAD_REQUEST,
      message: "Validation failed",
      errors: errors,
    };
  }

  // Handle CastError (invalid ID)
  if (err.name === MONGOOSE_ERROR_NAMES.CAST_ERROR) {
    return {
      status: HTTP_STATUS.BAD_REQUEST,
      message: `Invalid ${err.path}: ${err.value}`,
      errors: [{ field: err.path, message: `Invalid ${err.path}` }],
    };
  }

  // Handle JWT error
  if (err.name === JWT_ERROR_NAMES.INVALID_TOKEN) {
    return {
      status: HTTP_STATUS.UNAUTHORIZED,
      message: "Invalid token. Please login again!",
    };
  }

  if (err.name === JWT_ERROR_NAMES.TOKEN_EXPIRED) {
    return {
      status: HTTP_STATUS.UNAUTHORIZED,
      message: "Token expired. Please login again!",
    };
  }

  return null;
};

/**
 * Global error handling middleware
 */
const errHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || "Internal Server Error";
  let errors = null;

  // Check for Mongoose errors or other specific errors
  const handledError = handleMongooseError(err);
  if (handledError) {
    statusCode = handledError.status;
    message = handledError.message;
    errors = handledError.errors;
  }

  // Log detailed error information
  console.error("❌ Error Details:");
  console.error(`   Time: ${new Date().toISOString()}`);
  console.error(`   Method: ${req.method}`);
  console.error(`   Path: ${req.originalUrl}`);
  console.error(`   Status: ${statusCode}`);
  console.error(`   Message: ${message}`);
  if (process.env.NODE_ENV === "development") {
    console.error(`   Stack: ${err.stack}`);
  }

  // Use common error response
  return errorResponse(res, message, statusCode, errors);
};

module.exports = {
  notFound,
  errHandler,
};
