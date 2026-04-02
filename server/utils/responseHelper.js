const { HTTP_STATUS } = require("../constants/errorCodes.constants");

/**
 * Common response helper for consistent API responses
 */

/**
 * Success response
 * @param {Object} res - Express response object
 * @param {Object} data - Data to send
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const successResponse = (
  res,
  data = null,
  message = "Success",
  statusCode = HTTP_STATUS.OK,
) => {
  const response = {
    success: true,
    status: statusCode,
    message: message,
  };

  if (data) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Error response (used by error handler)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} errors - Validation errors (optional)
 */
const errorResponse = (
  res,
  message = "Error",
  statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  errors = null,
) => {
  const response = {
    success: false,
    status: statusCode,
    message: message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Created response (201)
 * @param {Object} res - Express response object
 * @param {Object} data - Created data
 * @param {string} message - Success message
 */
const createdResponse = (
  res,
  data = null,
  message = "Resource created successfully",
) => {
  return successResponse(res, data, message, HTTP_STATUS.CREATED);
};

/**
 * No content response (204)
 * @param {Object} res - Express response object
 */
const noContentResponse = (res) => {
  return res.status(HTTP_STATUS.NO_CONTENT).json();
};

/**
 * Pagination response
 * @param {Object} res - Express response object
 * @param {Array} data - Data array
 * @param {Object} pagination - Pagination info
 * @param {string} message - Success message
 */
const paginationResponse = (
  res,
  data,
  pagination,
  message = "Success",
  sort = null,
) => {
  const response = {
    success: true,
    status: HTTP_STATUS.OK,
    message: message,
    data: data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: pagination.totalPages,
      hasNext: pagination.page < pagination.totalPages,
      hasPrev: pagination.page > 1,
    },
  };

  if (sort) {
    response.sort = sort;
  }

  return res.status(HTTP_STATUS.OK).json(response);
};

/**
 * Validation error response (400)
 * @param {Object} res - Express response object
 * @param {Array} errors - Validation errors array
 * @param {string} message - Error message
 */
const validationErrorResponse = (
  res,
  errors,
  message = "Validation failed",
) => {
  return errorResponse(res, message, HTTP_STATUS.BAD_REQUEST, errors);
};

/**
 * Unauthorized response (401)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const unauthorizedResponse = (res, message = "Unauthorized access") => {
  return errorResponse(res, message, HTTP_STATUS.UNAUTHORIZED);
};

/**
 * Forbidden response (403)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const forbiddenResponse = (res, message = "Access forbidden") => {
  return errorResponse(res, message, HTTP_STATUS.FORBIDDEN);
};

/**
 * Not found response (404)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const notFoundResponse = (res, message = "Resource not found") => {
  return errorResponse(res, message, HTTP_STATUS.NOT_FOUND);
};

/**
 * Conflict response (409)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const conflictResponse = (res, message = "Resource already exists") => {
  return errorResponse(res, message, HTTP_STATUS.CONFLICT);
};

module.exports = {
  successResponse,
  errorResponse,
  createdResponse,
  noContentResponse,
  paginationResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  conflictResponse,
};
