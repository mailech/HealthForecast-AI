const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

// Load Environment Variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/healthforecast");
    console.log(`MongoDB Connected for Seeding: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Define Models (if not imported from models/ directory)
const User = mongoose.models.User || require("./models/User");
const Patient = mongoose.models.Patient || require("./models/Patient");

const seedDatabase = async () => {
  await connectDB();

  try {
    // 1. Clear existing seed data (optional)
    await User.deleteMany({});
    await Patient.deleteMany({});
    console.log("Cleared existing Users and Patients...");

    // 2. Hash default password ("password123")
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    // 3. Create Default Accounts for All 4 Roles & Live Test Users
    const users = [
      {
        name: "Velam Mounika",
        email: "mounikavelam@gmail.com",
        password: hashedPassword,
        role: "SYS_ADMIN",
        department: "IT & System Administration",
      },
      {
        name: "Student 23U41A4257",
        email: "23u41a4257@diet.edu.in",
        password: hashedPassword,
        role: "DOCTOR",
        department: "Cardiology & ICU",
      },
      {
        name: "Super Admin",
        email: "sysadmin@healthforecast.ai",
        password: hashedPassword,
        role: "SYS_ADMIN",
        department: "IT & Platform Governance",
      },
      {
        name: "Admin Sarah Jenkins",
        email: "admin@healthforecast.ai",
        password: hashedPassword,
        role: "HOSPITAL_ADMIN",
        department: "Hospital Administration",
      },
      {
        name: "Dr. John Smith",
        email: "john.smith@healthforecast.ai",
        password: hashedPassword,
        role: "DOCTOR",
        department: "Cardiology",
      },
      {
        name: "Dr. Emily Carter",
        email: "emily.carter@healthforecast.ai",
        password: hashedPassword,
        role: "DOCTOR",
        department: "Neurology",
      },
      {
        name: "Dr. Alan Turing",
        email: "researcher@healthforecast.ai",
        password: hashedPassword,
        role: "RESEARCHER",
        department: "Population Health & Research",
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`Successfully created ${createdUsers.length} User Accounts!`);

    // Find Doctor ID for patient assignment
    const doctorJohn = createdUsers.find((u) => u.email === "john.smith@healthforecast.ai");

    // 4. Create Initial Patient Records
    const patients = [
      {
        name: "Ramesh Kumar",
        age: 52,
        gender: "Male",
        disease: "Diabetes",
        riskScore: 88,
        riskCategory: "HIGH",
        risk: "High",
        status: "Active",
        vitals: { glucose: 185, bloodPressure: "140/90", bp: "140/90", bmi: 28.4 },
        previousAdmissions: 3,
        assignedDoctor: doctorJohn ? doctorJohn._id : null,
      },
      {
        name: "Priya Sharma",
        age: 43,
        gender: "Female",
        disease: "Hypertension",
        riskScore: 65,
        riskCategory: "MEDIUM",
        risk: "Medium",
        status: "Active",
        vitals: { glucose: 130, bloodPressure: "165/105", bp: "165/105", bmi: 24.1 },
        previousAdmissions: 1,
        assignedDoctor: doctorJohn ? doctorJohn._id : null,
      },
      {
        name: "Rahul Verma",
        age: 61,
        gender: "Male",
        disease: "Heart Disease",
        riskScore: 92,
        riskCategory: "HIGH",
        risk: "High",
        status: "Active",
        vitals: { glucose: 210, bloodPressure: "150/95", bp: "150/95", bmi: 31.2 },
        previousAdmissions: 4,
        assignedDoctor: doctorJohn ? doctorJohn._id : null,
      },
      {
        name: "Sneha Patel",
        age: 29,
        gender: "Female",
        disease: "Asthma",
        riskScore: 25,
        riskCategory: "LOW",
        risk: "Low",
        status: "Active",
        vitals: { glucose: 98, bloodPressure: "118/78", bp: "118/78", bmi: 21.5 },
        previousAdmissions: 0,
        assignedDoctor: doctorJohn ? doctorJohn._id : null,
      },
      {
        name: "Vikram Singh",
        age: 58,
        gender: "Male",
        disease: "Chronic Kidney Disease",
        riskScore: 82,
        riskCategory: "HIGH",
        risk: "High",
        status: "Discharged",
        vitals: { glucose: 175, bloodPressure: "138/88", bp: "138/88", bmi: 26.8 },
        previousAdmissions: 2,
        assignedDoctor: doctorJohn ? doctorJohn._id : null,
      },
    ];

    const createdPatients = await Patient.insertMany(patients);
    console.log(`Successfully created ${createdPatients.length} Patient Records!`);

    console.log("\n================ SEED COMPLETE ================");
    console.log("DEFAULT LOGIN CREDENTIALS (Password for all: password123):");
    console.log("1. System Admin:     sysadmin@healthforecast.ai");
    console.log("2. Hospital Admin:   admin@healthforecast.ai");
    console.log("3. Doctor:           john.smith@healthforecast.ai");
    console.log("4. Researcher:       researcher@healthforecast.ai");
    console.log("================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Error Seeding Database:", error);
    process.exit(1);
  }
};

seedDatabase();
