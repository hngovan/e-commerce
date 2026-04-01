const mongoose = require("mongoose");
const { ALLOWED_COLORS } = require("../constants/product.constants");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title must not exceed 200 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [5000, "Description must not exceed 5000 characters"],
    },
    brand: {
      type: String,
      required: [true, "Product brand is required"],
      trim: true,
      minlength: [2, "Brand must be at least 2 characters"],
      maxlength: [100, "Brand must not exceed 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price must be greater than or equal to 0"],
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, "Quantity must be greater than or equal to 0"],
    },
    sold: {
      type: Number,
      default: 0,
      min: [0, "Sold count must be greater than or equal to 0"],
    },
    images: {
      type: [String],
      default: [],
    },
    color: {
      type: String,
      enum: {
        values: ALLOWED_COLORS,
        message: "Color must be one of: " + ALLOWED_COLORS.join(", "),
      },
    },
    ratings: {
      type: [
        {
          star: {
            type: Number,
            min: 1,
            max: 5,
          },
          postedBy: {
            type: mongoose.Types.ObjectId,
            ref: "User",
          },
          comment: {
            type: String,
            maxlength: [500, "Comment must not exceed 500 characters"],
          },
        },
      ],
      default: [],
    },
    totalRatings: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for average rating
productSchema.virtual("averageRating").get(function () {
  if (
    !this.ratings ||
    !Array.isArray(this.ratings) ||
    this.ratings.length === 0
  ) {
    return 0;
  }
  const sum = this.ratings.reduce((acc, rating) => acc + rating.star, 0);
  return Number((sum / this.ratings.length).toFixed(1));
});

// Virtual for available quantity
productSchema.virtual("availableQuantity").get(function () {
  const quantity = this.quantity || 0;
  const sold = this.sold || 0;
  return quantity - sold;
});

module.exports = mongoose.model("Product", productSchema);
