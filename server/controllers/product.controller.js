const Product = require("../models/product.model");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const {
  successResponse,
  createdResponse,
  errorResponse,
  paginationResponse,
} = require("../utils/responseHelper");
const { HTTP_STATUS } = require("../constants/errorCodes.constants");
const { getPaginatedData } = require("../utils/paginationHelper");

/**
 * Create new product
 * @route POST /api/product
 * @access Private (Admin only)
 */
const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    brand,
    price,
    category,
    quantity,
    color,
    images,
  } = req.body;

  // Generate slug from title
  const slug = slugify(title, { lower: true, strict: true });

  // Check if product with same slug exists
  const existingProduct = await Product.findOne({ slug });
  if (existingProduct) {
    return errorResponse(
      res,
      "Product with similar title already exists",
      HTTP_STATUS.CONFLICT,
    );
  }

  // Create product
  const product = await Product.create({
    title,
    slug,
    description,
    brand,
    price,
    category,
    quantity: quantity || 0,
    color: color || null,
    images: images || [],
  });

  return createdResponse(
    res,
    product,
    "Product created successfully",
    HTTP_STATUS.CREATED,
  );
});

/**
 * Get all products
 * @route GET /api/product
 * @access Public
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 10)
 * @query {string} sort - Sort field (default: -createdAt)
 */
const getAllProducts = asyncHandler(async (req, res) => {
  const { data, pagination } = await getPaginatedData(Product, req, {
    defaultLimit: 10,
    maxLimit: 50,
    defaultSort: { createdAt: -1 },
    populate: { path: "category", select: "name slug" },
    select: "-__v",
  });

  // Return response with pagination
  return paginationResponse(
    res,
    data,
    pagination,
    "Products retrieved successfully",
  );
});

/**
 * Get product by ID or slug
 * @route GET /api/product/:id
 * @access Public
 */
const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Try to find by ID first, then by slug
  let product = await Product.findById(id)
    .populate("category", "name slug")
    .populate("ratings.postedBy", "firstName lastName email");

  if (!product) {
    product = await Product.findOne({ slug: id })
      .populate("category", "name slug")
      .populate("ratings.postedBy", "firstName lastName email");
  }

  if (!product) {
    return errorResponse(res, "Product not found", HTTP_STATUS.NOT_FOUND);
  }

  return successResponse(
    res,
    product,
    "Product retrieved successfully",
    HTTP_STATUS.OK,
  );
});

/**
 * Update product
 * @route PUT /api/product/:pid
 * @access Private (Admin only)
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const {
    title,
    description,
    brand,
    price,
    category,
    quantity,
    color,
    images,
  } = req.body;

  // Check if product exists
  const product = await Product.findById(pid);
  if (!product) {
    return errorResponse(res, "Product not found", HTTP_STATUS.NOT_FOUND);
  }

  // Build update data
  const updateData = {};
  if (title) {
    updateData.title = title;
    updateData.slug = slugify(title, { lower: true, strict: true });
  }
  if (description) updateData.description = description;
  if (brand) updateData.brand = brand;
  if (price) updateData.price = price;
  if (category) updateData.category = category;
  if (quantity !== undefined) updateData.quantity = quantity;
  if (color) updateData.color = color;
  if (images) updateData.images = images;

  // Update product
  const updatedProduct = await Product.findByIdAndUpdate(pid, updateData, {
    returnDocument: "after",
    runValidators: true,
  }).populate("category", "name slug");

  return successResponse(
    res,
    updatedProduct,
    "Product updated successfully",
    HTTP_STATUS.OK,
  );
});

/**
 * Delete product
 * @route DELETE /api/product/:pid
 * @access Private (Admin only)
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;

  const product = await Product.findByIdAndDelete(pid);

  if (!product) {
    return errorResponse(res, "Product not found", HTTP_STATUS.NOT_FOUND);
  }

  return successResponse(
    res,
    null,
    "Product deleted successfully",
    HTTP_STATUS.OK,
  );
});

/**
 * Add rating to product
 * @route POST /api/product/rating/:pid
 * @access Private
 */
const addRating = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const { star, comment } = req.body;
  const userId = req.user._id;

  const product = await Product.findById(pid);
  if (!product) {
    return errorResponse(res, "Product not found", HTTP_STATUS.NOT_FOUND);
  }

  // Check if user already rated
  const existingRating = product.ratings.find(
    (rating) => rating.postedBy.toString() === userId.toString(),
  );

  if (existingRating) {
    // Update existing rating
    existingRating.star = star;
    if (comment) existingRating.comment = comment;
  } else {
    // Add new rating
    product.ratings.push({
      star,
      comment,
      postedBy: userId,
    });
  }

  // Update total ratings count
  product.totalRatings = product.ratings.length;

  await product.save();

  return successResponse(
    res,
    {
      ratings: product.ratings,
      totalRatings: product.totalRatings,
      averageRating: product.averageRating,
    },
    "Rating added successfully",
    HTTP_STATUS.OK,
  );
});

/**
 * Search products
 * @route GET /api/product/search
 * @access Public
 */
const searchProducts = asyncHandler(async (req, res) => {
  const { q, category, brand, minPrice, maxPrice, color } = req.query;

  // Build search query
  const query = {};

  if (q) {
    query.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { brand: { $regex: q, $options: "i" } },
    ];
  }

  if (category) query.category = category;
  if (brand) query.brand = { $regex: brand, $options: "i" };
  if (color) query.color = color;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const { data, pagination, sort } = await getPaginatedData(Product, req, {
    defaultLimit: 10,
    maxLimit: 50,
    defaultSort: { createdAt: -1 },
    populate: { path: "category", select: "name slug" },
    select: "-__v",
    filter: query,
    allowedSortFields: [
      "title",
      "price",
      "createdAt",
      "sold",
      "quantity",
      "totalRatings",
    ],
  });

  return paginationResponse(
    res,
    data,
    pagination,
    "Products retrieved successfully",
    sort,
  );
});

module.exports = {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  addRating,
  searchProducts,
};
