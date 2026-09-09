require("dotenv").config();

const express = require("express");
const cors = require("cors");

const db = require("./config/db");

// ===============================
// ROUTES
// ===============================

const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const treatmentRoutes = require("./routes/treatmentRoutes");
const userRoutes = require("./routes/userRoutes");

// ===============================
// APP
// ===============================

const app = express();

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// ROOT
// ===============================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Final Healthcare API is running"
    });
});

// ===============================
// DATABASE TEST
// ===============================

app.get("/api/test-db", (req, res) => {

    db.query("SELECT 1 AS test", (err, result) => {

        if (err) {
            console.error("Database error:", err);

            return res.status(500).json({
                success: false,
                message: "Database connection failed"
            });
        }

        res.json({
            success: true,
            message: "Database is working",
            result: result
        });
    });

});

// ===============================
// AUTH ROUTES
// ===============================

app.use("/api/auth", authRoutes);

// ===============================
// PATIENT ROUTES
// ===============================

app.use("/api/patients", patientRoutes);

// ===============================
// PREDICTION ROUTES
// ===============================

app.use("/api/predictions", predictionRoutes);

// ===============================
// TREATMENT ROUTES
// ===============================

app.use("/api/treatments", treatmentRoutes);

// ===============================
// USER ROUTES
// ===============================

app.use("/api/users", userRoutes);

// ===============================
// 404 HANDLER
// ===============================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "Route not found"
    });

});

// ===============================
// ERROR HANDLER
// ===============================

app.use((err, req, res, next) => {

    console.error("Server Error:", err);

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });

});

// ===============================
// START SERVER
// ===============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `🚀 Server running on http://localhost:${PORT}`
    );

});