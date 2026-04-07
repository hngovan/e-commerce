const BlogCategory = require("../models/blogCategory.model");
const asyncHandler = require("express-async-handler");
const {
  successResponse,
  createdResponse,
  errorResponse,
  paginationResponse,
} = require("../utils/responseHelper");
const { HTTP_STATUS } = require("../constants/errorCodes.constants");
const { getPaginatedData } = require("../utils/paginationHelper");

/**
 * Create new blog category
 * @route POST /api/blog-category
 * @access Private (Admin only)
 */
const createCategory = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  // Check if category with same title exists
  const existingCategory = await BlogCategory.findOne({ title });
  if (existingCategory) {
    return errorResponse(
      res,
      "Blog category with this title already exists",
      HTTP_STATUS.CONFLICT,
    );
  }

  // Create category
  const category = await BlogCategory.create({
    title,
    description: description || "",
  });

  return createdResponse(
    res,
    category,
    "Blog category created successfully",
    HTTP_STATUS.CREATED,
  );
});

/**
 * Get all blog categories with pagination
 * @route GET /api/blog-category
 * @access Public
 */
const getAllCategories = asyncHandler(async (req, res) => {
  const { isActive } = req.query;

  const query = {};
  if (isActive !== undefined) query.isActive = isActive === "true";

  const { data, pagination } = await getPaginatedData(BlogCategory, req, {
    defaultLimit: 20,
    maxLimit: 50,
    defaultSort: { createdAt: -1 },
    select: "-__v",
    filter: query,
  });

  return paginationResponse(
    res,
    data,
    pagination,
    "Blog categories retrieved successfully",
  );
});

/**
 * Get single blog category by ID or slug
 * @route GET /api/blog-category/:id
 * @access Public
 */
const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Try to find by ID first, then by slug
  let category = await BlogCategory.findById(id);

  if (!category) {
    category = await BlogCategory.findOne({ slug: id });
  }

  if (!category) {
    return errorResponse(res, "Blog category not found", HTTP_STATUS.NOT_FOUND);
  }

  return successResponse(
    res,
    category,
    "Blog category retrieved successfully",
    HTTP_STATUS.OK,
  );
});

/**
 * Update blog category
 * @route PUT /api/blog-category/:id
 * @access Private (Admin only)
 */
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, isActive } = req.body;

  // Check if category exists
  const category = await BlogCategory.findById(id);
  if (!category) {
    return errorResponse(res, "Blog category not found", HTTP_STATUS.NOT_FOUND);
  }

  // Check for duplicate title if updating title
  if (title && title !== category.title) {
    const existingCategory = await BlogCategory.findOne({
      title,
      _id: { $ne: id },
    });

    if (existingCategory) {
      return errorResponse(
        res,
        "Blog category with this title already exists",
        HTTP_STATUS.CONFLICT,
      );
    }
  }

  // Build update data
  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (isActive !== undefined) updateData.isActive = isActive;

  const updatedCategory = await BlogCategory.findByIdAndUpdate(
    id,
    updateData,
    {
      returnDocument: 'after',
      runValidators: true,
    }
  );

  return successResponse(
    res,
    updatedCategory,
    "Blog category updated successfully",
    HTTP_STATUS.OK,
  );
});

/**
 * Delete blog category
 * @route DELETE /api/blog-category/:id
 * @access Private (Admin only)
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if category exists
  const category = await BlogCategory.findById(id);
  if (!category) {
    return errorResponse(res, "Blog category not found", HTTP_STATUS.NOT_FOUND);
  }

  await BlogCategory.findByIdAndDelete(id);

  return successResponse(
    res,
    null,
    "Blog category deleted successfully",
    HTTP_STATUS.OK,
  );
});

module.exports = {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
