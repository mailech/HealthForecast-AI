const request = require("supertest");
const express = require("express");

// Import middleware & handlers
const { notFound, errorHandler } = require("../middleware/errorMiddleware");
const authRoutes = require("../routes/authRoutes");
const patientRoutes = require("../routes/patientRoutes");
const predictionRoutes = require("../routes/predictionRoutes");
const alertRoutes = require("../routes/alertRoutes");

// Initialize test Express application
const app = express();
app.use(express.json());

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "HealthForecast AI Backend API Operational",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/prediction", predictionRoutes);
app.use("/api/alerts", alertRoutes);

app.use(notFound);
app.use(errorHandler);

describe("Backend Integration API Test Suite", () => {
  it("GET /api/test should return 200 OK and operational status", async () => {
    const response = await request(app).get("/api/test");
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain("Operational");
  });

  it("POST /api/prediction/predict should validate missing parameters and return 400 Bad Request", async () => {
    const response = await request(app).post("/api/prediction/predict").send({
      patientName: "Test Patient",
      // missing required metrics
    });
    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("POST /api/auth/forgot-password should return 200 OK for valid email", async () => {
    const response = await request(app).post("/api/auth/forgot-password").send({
      email: "john.smith@healthforecast.ai",
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain("Password reset link");
  });

  it("POST /api/auth/request-credentials should return 201 Created for valid request", async () => {
    const response = await request(app).post("/api/auth/request-credentials").send({
      name: "Test Staff",
      email: "staff.test@healthforecast.ai",
      department: "Clinical Care",
      requestedRole: "DOCTOR",
      reason: "Attending physician hospital duty",
    });
    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain("submitted successfully");
  });

  it("GET /api/unknown-endpoint should trigger 404 Route Not Found middleware", async () => {
    const response = await request(app).get("/api/unknown-endpoint");
    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain("Route Not Found");
  });
});
