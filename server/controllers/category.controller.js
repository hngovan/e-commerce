const Category = require("../models/category.model");
const Product = require("../models/product.model");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const {
  successResponse,
  createdResponse,
  errorResponse,
} = require("../utils/responseHelper");
const { HTTP_STATUS } = require("../constants/errorCodes.constants");

/**
 * Create new category
 * @route POST /api/category
 * @access Private (Admin only)
 */
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;

  // Generate slug from name
  const slug = slugify(name, { lower: true, strict: true });

  // Check if category with same name or slug exists
  const existingCategory = await Category.findOne({
    $or: [{ name }, { slug }],
  });

  if (existingCategory) {
    return errorResponse(
      res,
      "Category with similar name already exists",
      HTTP_STATUS.CONFLICT,
    );
  }

  // Create category
  const category = await Category.create({
    name,
    slug,
    description,
    image,
  });

  return createdResponse(
    res,
    category,
    "Category created successfully",
    HTTP_STATUS.CREATED,
  );
});

/**
 * Get all categories
 * @route GET /api/category
 * @access Public
 */
const getAllCategories = asyncHandler(async (req, res) => {
  const { isActive, page = 1, limit = 50 } = req.query;

  const query = {};
  if (isActive !== undefined) query.isActive = isActive === "true";

  const skip = (page - 1) * limit;
  const total = await Category.countDocuments(query);

  const categories = await Category.find(query)
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  // Get product count for each category
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const productCount = await Product.countDocuments({
        category: category._id,
      });
      return {
        ...category.toObject(),
        productCount,
      };
    }),
  );

  const pagination = {
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / limit),
  };

  return successResponse(
    res,
    categoriesWithCount,
    "Categories retrieved successfully",
    HTTP_STATUS.OK,
    pagination,
  );
});

/**
 * Get single category by ID or slug
 * @route GET /api/category/:id
 * @access Public
 */
const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Try to find by ID first, then by slug
  let category = await Category.findById(id);

  if (!category) {
    category = await Category.findOne({ slug: id });
  }

  if (!category) {
    return errorResponse(res, "Category not found", HTTP_STATUS.NOT_FOUND);
  }

  // Get products in this category
  const products = await Product.find({ category: category._id })
    .select("title slug price images sold")
    .limit(10)
    .sort({ createdAt: -1 });

  const productCount = await Product.countDocuments({ category: category._id });

  const categoryData = {
    ...category.toObject(),
    productCount,
    products,
  };

  return successResponse(
    res,
    categoryData,
    "Category retrieved successfully",
    HTTP_STATUS.OK,
  );
});

/**
 * Update category
 * @route PUT /api/category/:id
 * @access Private (Admin only)
 */
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, image, isActive } = req.body;

  // Check if category exists
  const category = await Category.findById(id);
  if (!category) {
    return errorResponse(res, "Category not found", HTTP_STATUS.NOT_FOUND);
  }

  // Build update data
  const updateData = {};
  if (name) {
    updateData.name = name;
    updateData.slug = slugify(name, { lower: true, strict: true });
  }
  if (description !== undefined) updateData.description = description;
  if (image !== undefined) updateData.image = image;
  if (isActive !== undefined) updateData.isActive = isActive;

  // Check for duplicate name/slug if updating name
  if (name && name !== category.name) {
    const existingCategory = await Category.findOne({
      $or: [{ name }, { slug: updateData.slug }],
      _id: { $ne: id },
    });

    if (existingCategory) {
      return errorResponse(
        res,
        "Category with similar name already exists",
        HTTP_STATUS.CONFLICT,
      );
    }
  }

  // Update category
  const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
    returnDocument: "after",
    runValidators: true,
  });

  return successResponse(
    res,
    updatedCategory,
    "Category updated successfully",
    HTTP_STATUS.OK,
  );
});

/**
 * Delete category
 * @route DELETE /api/category/:id
 * @access Private (Admin only)
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if category exists
  const category = await Category.findById(id);
  if (!category) {
    return errorResponse(res, "Category not found", HTTP_STATUS.NOT_FOUND);
  }

  // Check if there are products in this category
  const productCount = await Product.countDocuments({ category: id });
  if (productCount > 0) {
    return errorResponse(
      res,
      `Cannot delete category. There are ${productCount} products in this category. Please reassign or delete them first.`,
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  await Category.findByIdAndDelete(id);

  return successResponse(
    res,
    null,
    "Category deleted successfully",
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
