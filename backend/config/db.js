const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Mongoose Version:", mongoose.version);
    console.log("Connecting to:", process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error(err);
  }
};

module.exports = connectDB;