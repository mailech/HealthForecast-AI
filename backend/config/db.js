const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_management';
    
    if (process.env.NODE_ENV !== 'production' && (mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost'))) {
      try {
        console.log('Attempting to connect to local MongoDB...');
        const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
        console.log(`MongoDB Connected (Local): ${conn.connection.host}`);
        return;
      } catch (localError) {
        console.log('Local MongoDB not running. Starting In-Memory MongoDB Server...');
        const mongoServer = await MongoMemoryServer.create();
        mongoUri = mongoServer.getUri();
        console.log(`In-Memory MongoDB Started at: ${mongoUri}`);
      }
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Automatically seed database if empty
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database is empty. Seeding initial data...');
      const seedData = require('../utils/seeder');
      await seedData();
    }
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
