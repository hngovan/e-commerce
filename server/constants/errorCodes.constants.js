/**
 * MongoDB Error Codes
 */
const MONGO_ERROR_CODES = {
  DUPLICATE_KEY: 11000,
  DUPLICATE_KEY_OLD: 11001, // Sometimes used in older versions
};

/**
 * HTTP Status Codes
 * Common status codes used in REST APIs
 */
const HTTP_STATUS = {
  // 2xx Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // 4xx Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

/**
 * Mongoose Error Names
 */
const MONGOOSE_ERROR_NAMES = {
  VALIDATION_ERROR: "ValidationError",
  CAST_ERROR: "CastError",
  DUPLICATE_KEY: "MongoServerError", // Mongoose uses this for duplicate key
};

/**
 * JWT Error Names
 */
const JWT_ERROR_NAMES = {
  INVALID_TOKEN: "JsonWebTokenError",
  TOKEN_EXPIRED: "TokenExpiredError",
  NOT_BEFORE: "NotBeforeError",
};

module.exports = {
  MONGO_ERROR_CODES,
  HTTP_STATUS,
  MONGOOSE_ERROR_NAMES,
  JWT_ERROR_NAMES,
};
