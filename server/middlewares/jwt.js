const jwt = require("jsonwebtoken");

// Access token used for daily authentication (short-lived: 3 days)
const generateAccessToken = (uid, role) => {
  return jwt.sign({ _id: uid, role }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
};

// Refresh token used to request a new access token (longer-lived: 7 days)
const generateRefreshToken = (uid) => {
  return jwt.sign({ _id: uid }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

module.exports = { generateAccessToken, generateRefreshToken };
