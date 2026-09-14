const mongoose = require("mongoose");
const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

const connectDB = async () => {
  try {
    console.log("Mongoose Version:", mongoose.version);

    let mongoUri = process.env.MONGO_URI || "";

    // Automatically fix accidental mongodb+srv:// usage pointing to direct shard hostnames
    if (mongoUri.startsWith("mongodb+srv://") && mongoUri.includes("-shard-")) {
      mongoUri = mongoUri.replace("mongodb+srv://", "mongodb://");
    }

    console.log("Connecting to MongoDB Atlas...");

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ MongoDB Connected successfully");
  } catch (err) {
    console.error("⚠️ MongoDB Connection Error:", err.message);
    console.log("Backend running in resilient mode (operating with in-memory / fallback data).");
  }
};

module.exports = connectDB;