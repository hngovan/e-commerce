const mongoose = require("mongoose");
const slugify = require("slugify");

const blogCategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog category title is required"],
      unique: true,
      index: true,
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [100, "Title must not exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must not exceed 500 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for blog count (optional)
blogCategorySchema.virtual("blogCount", {
  ref: "Blog",
  localField: "_id",
  foreignField: "category",
  count: true,
});

// Pre-save middleware to generate slug from title
blogCategorySchema.pre("save", async function () {
  if (this.title && this.isModified("title")) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      locale: "vi",
      trim: true,
      replacement: "-",
    });
  }
});

blogCategorySchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate();
  if (update.title) {
    const newSlug = slugify(update.title, {
      lower: true,
      strict: true,
      locale: "vi",
      trim: true,
      replacement: "-",
    });
    update.slug = newSlug;
  }
});

module.exports = mongoose.model("BlogCategory", blogCategorySchema);
