/**
 * Pagination helper
 * Provides reusable pagination logic for all models
 */

/**
 * Get pagination parameters from request query
 * @param {Object} query - Express request query object
 * @param {number} defaultLimit - Default items per page (default: 10)
 * @param {number} maxLimit - Maximum items per page (default: 100)
 * @returns {Object} Pagination parameters
 */
const getPaginationParams = (query, defaultLimit = 10, maxLimit = 100) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  let limit = parseInt(query.limit) || defaultLimit;

  // Limit max items per page
  limit = Math.min(limit, maxLimit);

  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};

/**
 * Get sort object from query
 * @param {Object} query - Express request query object
 * @param {Object} defaultSort - Default sort options
 * @returns {Object} Sort object for Mongoose
 */
const getSortParams = (query, defaultSort = { createdAt: -1 }) => {
  if (query.sort) {
    const sortField = query.sort.replace(/^-/, "");
    const sortOrder = query.sort.startsWith("-") ? -1 : 1;
    return { [sortField]: sortOrder };
  }
  return defaultSort;
};

/**
 * Get sort options for response (human readable)
 * @param {Object} query - Express request query object
 * @returns {Object} Sort options
 */
const getSortOptions = (query) => {
  if (!query.sort) return { field: "createdAt", order: "desc" };

  const sortFields = query.sort.split(",");
  const options = sortFields.map((field) => ({
    field: field.replace(/^-/, ""),
    order: field.startsWith("-") ? "desc" : "asc",
  }));

  return options;
};

/**
 * Build pagination metadata
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items count
 * @returns {Object} Pagination metadata
 */
const buildPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

/**
 * Execute paginated query
 * @param {Object} model - Mongoose model
 * @param {Object} query - Filter query
 * @param {Object} pagination - Pagination params { page, limit, skip }
 * @param {Object} sort - Sort options
 * @param {Array} populate - Populate options (optional)
 * @param {string} select - Select fields (optional)
 * @returns {Promise<Object>} Paginated result
 */
const executePaginatedQuery = async (
  model,
  query = {},
  pagination,
  sort = {},
  populate = null,
  select = null,
) => {
  const { skip, limit } = pagination;

  // Build base query
  let findQuery = model.find(query);

  // Apply select if provided
  if (select) {
    findQuery = findQuery.select(select);
  }

  // Apply populate if provided
  if (populate) {
    if (Array.isArray(populate)) {
      populate.forEach((pop) => {
        findQuery = findQuery.populate(pop);
      });
    } else {
      findQuery = findQuery.populate(populate);
    }
  }

  // Execute queries in parallel
  const [total, data] = await Promise.all([
    model.countDocuments(query),
    findQuery.sort(sort).skip(skip).limit(limit),
  ]);

  return {
    data,
    total,
  };
};

/**
 * Get paginated data (one-liner)
 * @param {Object} model - Mongoose model
 * @param {Object} req - Express request object
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Paginated result with metadata
 */
const getPaginatedData = async (model, req, options = {}) => {
  const {
    defaultLimit = 10,
    maxLimit = 100,
    defaultSort = { createdAt: -1 },
    populate = null,
    select = null,
    filter = {},
    allowedSortFields = [],
  } = options;

  // Get pagination params
  const pagination = getPaginationParams(req.query, defaultLimit, maxLimit);

  // Validate sort fields if allowedSortFields provided
  let sort = getSortParams(req.query, defaultSort);
  if (allowedSortFields.length > 0) {
    const invalidFields = Object.keys(sort).filter(
      (field) => !allowedSortFields.includes(field),
    );
    if (invalidFields.length > 0) {
      sort = defaultSort;
    }
  }

  // Merge filter with query params if needed
  const query = { ...filter };

  // Execute query
  const { data, total } = await executePaginatedQuery(
    model,
    query,
    pagination,
    sort,
    populate,
    select,
  );

  // Build pagination metadata
  const paginationMeta = buildPaginationMeta(
    pagination.page,
    pagination.limit,
    total,
  );

  return {
    data,
    pagination: paginationMeta,
    sort: getSortOptions(req.query),
  };
};

module.exports = {
  getPaginationParams,
  getSortParams,
  getSortOptions,
  buildPaginationMeta,
  executePaginatedQuery,
  getPaginatedData,
};
