const { default: mongoose } = require("mongoose");

const dbConnect = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    if (conn.connection.readyState === 1) {
      console.log("✅ Database connection successful!");
    } else {
      console.log("⏳ Connecting to the Database...");
    }
  } catch (error) {
    console.log("❌ Database connection failed!");
    throw new Error(error);
  }
};

module.exports = dbConnect;
