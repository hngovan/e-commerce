const mongoose = require("mongoose");
const { hashToken, generateRandomToken } = require("../utils/cryptoHelper");
const bcrypt = require("bcrypt");
const { ROLES } = require("../constants/role.constants");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, index: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      default: ROLES.USER,
      enum: [ROLES.USER, ROLES.ADMIN],
    },
    cart: { type: Array, default: [] },
    address: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    isBlocked: { type: Boolean, default: false },
    refreshToken: { type: String },
    passwordChangeAt: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: String },
  },
  {
    timestamps: true, // Automatically generate the two fields createdAt and updatedAt
  },
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods = {
  // Compare password
  isCorrectPassword: async function (password) {
    return await bcrypt.compare(password, this.password);
  },

  // Check if user is blocked
  checkIsBlocked: function () {
    return this.isBlocked === true;
  },

  // Create password reset token
  createPasswordResetToken: function () {
    const resetToken = generateRandomToken();

    this.passwordResetToken = hashToken(resetToken);

    // exp 15 minutes
    this.passwordResetExpires = Date.now() + 15 * 60 * 1000;

    return resetToken;
  },

  // Update password change timestamp
  updatePasswordChangeAt: function () {
    this.passwordChangeAt = Date.now();
    return this.save();
  },
};
module.exports = mongoose.model("User", userSchema);
