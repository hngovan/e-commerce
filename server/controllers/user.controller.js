const User = require("../models/user.model");
const asyncHandler = require("express-async-handler");
const {
  successResponse,
  createdResponse,
  errorResponse,
} = require("../utils/responseHelper");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middlewares/jwt");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const {
  HTTP_STATUS,
  JWT_ERROR_NAMES,
} = require("../constants/errorCodes.constants");
const { hashToken } = require("../utils/cryptoHelper");

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    return errorResponse(res, "Invalid credentials!", HTTP_STATUS.UNAUTHORIZED);
  }

  if (user.isBlocked) {
    return errorResponse(
      res,
      "Your account has been blocked. Please contact support.",
      HTTP_STATUS.FORBIDDEN,
    );
  }

  // Check password
  const isMatch = await user.isCorrectPassword(password);
  if (!isMatch) {
    return errorResponse(res, "Invalid credentials!", HTTP_STATUS.UNAUTHORIZED);
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  await User.findByIdAndUpdate(
    user._id,
    { refreshToken },
    { returnDocument: "after" },
  );

  // Set refresh token in cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // Remove sensitive data  (password and refreshToken)
  const { password: _, refreshToken: __, role, ...userData } = user.toObject();

  const responseData = {
    userData,
    accessToken,
  };

  return successResponse(res, responseData, "Login successful", HTTP_STATUS.OK);
});

const register = asyncHandler(async (req, res) => {
  const { email, mobile } = req.body;

  // Check if email exists
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    return errorResponse(res, "Email already exists!", HTTP_STATUS.CONFLICT);
  }

  // Check if mobile exists
  const existingMobile = await User.findOne({ mobile });
  if (existingMobile) {
    return errorResponse(
      res,
      "Mobile number already exists!",
      HTTP_STATUS.CONFLICT,
    );
  }

  const user = await User.create(req.body);

  // Remove password from response
  const { password: _, ...userData } = user.toObject();

  return createdResponse(res, userData, "User registered successfully!");
});

const forgotPassword = asyncHandler(async (req, res) => {
  // Get email from request body (RESTful standard)
  const { email } = req.body;

  // Validate email
  if (!email) {
    return errorResponse(res, "Email is required", HTTP_STATUS.BAD_REQUEST);
  }

  // Find user by email
  const user = await User.findOne({ email });

  if (user.isBlocked) {
    return successResponse(
      res,
      null,
      "Your account has been blocked. Cannot forgot password. Please contact support.",
      HTTP_STATUS.OK,
    );
  }

  // For security, don't reveal if email exists or not
  if (!user) {
    return successResponse(
      res,
      null,
      "If email exists, password reset link has been sent",
      HTTP_STATUS.OK,
    );
  }

  // Generate password reset token
  const resetToken = user.createPasswordResetToken();
  await user.save();

  // Create reset URL
  const resetURL = `${process.env.URL_SERVER}/reset-password/${resetToken}`;

  // Email content
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>Hello ${user.firstName || user.email},</p>
      <p>You requested to reset your password. Click the link below to reset it:</p>
      <p>
        <a href="${resetURL}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p>${resetURL}</p>
      <p>This link will expire in 15 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr />
      <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
    </div>
  `;

  // Send email
  const emailData = {
    to: email,
    subject: "Password Reset Request - E-commerce",
    html,
  };

  // Send email (you need to implement sendMail function)
  await sendMail(emailData);

  // Return success response
  return successResponse(
    res,
    null,
    "Password reset link has been sent to your email",
    HTTP_STATUS.OK,
  );
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Hash the token to compare with database
  const hashedToken = hashToken(token);

  // Find user with valid reset token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // Check if token is valid
  if (!user) {
    return errorResponse(
      res,
      "Invalid or expired reset token. Please request a new password reset.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (user.isBlocked) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return errorResponse(
      res,
      "Your account has been blocked. Cannot reset password. Please contact support.",
      HTTP_STATUS.FORBIDDEN,
    );
  }

  // Update password and clear reset token fields
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangeAt = Date.now();

  await user.save();

  // Return success response
  return successResponse(
    res,
    null,
    "Password has been reset successfully. Please login with your new password.",
    HTTP_STATUS.OK,
  );
});

const refreshToken = asyncHandler(async (req, res) => {
  // Get refresh token from cookies (automatically sent by browser)
  const refreshToken = req.cookies?.refreshToken;

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Verify that the token belongs to a valid user and matches the one in database
    const user = await User.findOne({
      _id: decoded._id,
      refreshToken: refreshToken,
    });

    // Check if user exists and refresh token matches
    if (!user) {
      return errorResponse(
        res,
        "Invalid refresh token. Please login again.",
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    if (user.isBlocked) {
      await User.findByIdAndUpdate(user._id, { refreshToken: "" });

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return errorResponse(
        res,
        "Your account has been blocked. Please contact support.",
        HTTP_STATUS.FORBIDDEN,
      );
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user._id, user.role);

    // Return the new access token
    return successResponse(
      res,
      { accessToken: newAccessToken },
      "Access token refreshed successfully",
      HTTP_STATUS.OK,
    );
  } catch (error) {
    // Handle JWT verification errors
    if (error.name === JWT_ERROR_NAMES.TOKEN_EXPIRED) {
      return errorResponse(
        res,
        "Refresh token expired. Please login again.",
        HTTP_STATUS.UNAUTHORIZED,
      );
    }
    return errorResponse(
      res,
      "Invalid refresh token. Please login again.",
      HTTP_STATUS.UNAUTHORIZED,
    );
  }
});

const logout = asyncHandler(async (req, res) => {
  // Get refresh token from cookies (automatically sent by browser)
  const refreshToken = req.cookies?.refreshToken;

  // If refresh token exists, remove it from database
  if (refreshToken) {
    // Find user with this refresh token and remove it
    await User.findOneAndUpdate(
      { refreshToken: refreshToken },
      { refreshToken: "" },
      { returnDocument: "after" },
    );
  }

  // Clear the refresh token cookie from browser
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  // Return success response
  return successResponse(res, null, "Logged out successfully", HTTP_STATUS.OK);
});

const getCurrent = asyncHandler(async (req, res) => {
  // Get user ID from the verified token (set by verifyAccessToken middleware)
  const { _id } = req.user;

  // Find user and exclude sensitive fields
  // The minus sign (-) means "exclude these fields from the result"
  const user = await User.findById(_id).select("-refreshToken -password -role");

  // Check if user exists
  if (!user) {
    return errorResponse(res, "User not found", HTTP_STATUS.NOT_FOUND);
  }

  // Return user data
  return successResponse(res, user, "User profile retrieved successfully");
});

const getAllUsers = asyncHandler(async (_req, res) => {
  // Get all users
  const users = await User.find().select("-password -refreshToken"); // Exclude sensitive fields

  // Return success response with users data
  return successResponse(
    res,
    users,
    "Users retrieved successfully",
    HTTP_STATUS.OK,
  );
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent admin from deleting themselves
  if (req.user._id === id) {
    return errorResponse(
      res,
      "You cannot delete your own account",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    return errorResponse(res, "User not found", HTTP_STATUS.NOT_FOUND);
  }

  return successResponse(res, null, "User deleted successfully");
});

const updateUser = asyncHandler(async (req, res) => {
  // Get user ID from verified token (set by verifyAccessToken middleware)
  const { _id } = req.user;

  // Get update data from request body
  const { firstName, lastName, mobile } = req.body;

  // Build update object with only allowed fields
  const updateData = {};
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (mobile) updateData.mobile = mobile;

  // Check if there's data to update
  if (!_id || Object.keys(updateData).length === 0) {
    const currentUser = await User.findById(_id).select(
      "-password -refreshToken",
    );
    return successResponse(res, currentUser, "No changes made", HTTP_STATUS.OK);
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(_id, updateData, {
    returnDocument: "after", // Return updated document
  }).select("-password -refreshToken -role"); // Exclude sensitive fields

  // Check if user exists
  if (!updatedUser) {
    return errorResponse(res, "User not found", HTTP_STATUS.NOT_FOUND);
  }

  return successResponse(
    res,
    updatedUser,
    "User profile updated successfully",
    HTTP_STATUS.OK,
  );
});

const updateUserByAdmin = asyncHandler(async (req, res) => {
  // Get user ID from URL params
  const { uid } = req.params;

  // Validate user ID
  if (!uid) {
    return errorResponse(res, "User ID is required", HTTP_STATUS.BAD_REQUEST);
  }

  // Get update data from request body
  const { firstName, lastName, mobile, role, isBlocked } = req.body;

  // Check if there's data to update
  if (!firstName && !lastName && !mobile && !role && isBlocked === undefined) {
    return errorResponse(
      res,
      "No update data provided. Please provide at least one field to update.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  // Build update object with only allowed fields
  const updateData = {};
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (mobile) updateData.mobile = mobile;
  if (role) updateData.role = role;
  if (isBlocked !== undefined) updateData.isBlocked = isBlocked;

  // Update user
  const updatedUser = await User.findByIdAndUpdate(uid, updateData, {
    returnDocument: "after",
  }).select("-password -refreshToken");

  if (!updatedUser) {
    return errorResponse(res, "User not found", HTTP_STATUS.NOT_FOUND);
  }

  // Return success response
  return successResponse(
    res,
    updatedUser,
    "User updated successfully by admin",
    HTTP_STATUS.OK,
  );
});

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  getCurrent,
  getAllUsers,
  deleteUser,
  updateUser,
  updateUserByAdmin,
};
