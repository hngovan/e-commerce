// Load environment variables
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/dbConnect");
const initRouter = require("./routers");

const app = express();

// Connect DB
connectDB();

const PORT = process.env.PORT || 8080;

// Middleware parse JSON
app.use(express.json());
// Middleware parse form data
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

initRouter(app);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || `development`}`);
});

app.get("/", (req, res) => {
  res.send("🚀 Server E-commerce is running...");
});
