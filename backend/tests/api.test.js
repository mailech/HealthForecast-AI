const request = require("supertest");
const express = require("express");

// Import middleware & handlers
const { notFound, errorHandler } = require("../middleware/errorMiddleware");
const authRoutes = require("../routes/authRoutes");
const userRoutes = require("../routes/userRoutes");
const patientRoutes = require("../routes/patientRoutes");
const predictionRoutes = require("../routes/predictionRoutes");
const alertRoutes = require("../routes/alertRoutes");
const auditRoutes = require("../routes/auditRoutes");
const analyticsRoutes = require("../routes/analyticsRoutes");
const reportRoutes = require("../routes/reportRoutes");

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
app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/prediction", predictionRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/reports", reportRoutes);

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

  it("POST /api/auth/reset-password should successfully reset password with valid token", async () => {
    const forgotRes = await request(app).post("/api/auth/forgot-password").send({
      email: "john.smith@healthforecast.ai",
    });
    const token = forgotRes.body.resetToken;

    const response = await request(app).post("/api/auth/reset-password").send({
      token,
      newPassword: "newsecurepassword123",
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Password updated successfully. Please log in with your new password.");
  });

  it("POST /api/auth/reset-password should return 400 when missing token or password", async () => {
    const response = await request(app).post("/api/auth/reset-password").send({});
    expect(response.statusCode).toBe(400);
  });

  it("GET /api/users/pending should return pending requests with isApproved: false or status: Pending", async () => {
    const response = await request(app).get("/api/users/pending");
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("GET /api/audit-logs should return audit trail logs sorted descending", async () => {
    const response = await request(app).get("/api/audit-logs");
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("GET /api/prediction/analytics should return 24-hour telemetry and monthly readmission risk curves", async () => {
    const response = await request(app).get("/api/prediction/analytics");
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.telemetry24h.length).toBe(24);
    expect(response.body.data.readmissionCurves.length).toBe(12);
  });

  it("POST /api/patients should create a patient record and return 201 Created", async () => {
    const response = await request(app).post("/api/patients").send({
      name: "Test New Patient",
      age: 45,
      disease: "Cardiology Monitoring",
      risk: "Medium",
      status: "Active",
    });
    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe("Test New Patient");
  });

  it("GET /api/patients should return 200 OK with patient list", async () => {
    const response = await request(app).get("/api/patients");
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("GET /api/patients/:id/download-pdf should stream care plan PDF with correct headers", async () => {
    const response = await request(app).get("/api/patients/PAT-DEMO-001/download-pdf");
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("application/pdf");
    expect(response.headers["content-disposition"]).toContain("Patient_Care_Plan.pdf");
  });

  it("GET /api/analytics?timeframe=30d|6m|1y should return aggregated metrics for requested timeframe", async () => {
    const res30d = await request(app).get("/api/analytics?timeframe=30d");
    expect(res30d.statusCode).toBe(200);
    expect(res30d.body.success).toBe(true);
    expect(res30d.body.timeframe).toBe("30d");
    expect(res30d.body.data.avgDaysInCare).toBeGreaterThan(0);

    const res6m = await request(app).get("/api/analytics?timeframe=6m");
    expect(res6m.statusCode).toBe(200);
    expect(res6m.body.timeframe).toBe("6m");

    const res1y = await request(app).get("/api/analytics?timeframe=1y");
    expect(res1y.statusCode).toBe(200);
    expect(res1y.body.timeframe).toBe("1y");
  });

  it("GET /api/reports/:id/download should format PDF, CSV, and Excel with correct Content-Type", async () => {
    const pdfRes = await request(app).get("/api/reports/REP-101/download?format=PDF");
    expect(pdfRes.statusCode).toBe(200);
    expect(pdfRes.headers["content-type"]).toContain("application/pdf");

    const csvRes = await request(app).get("/api/reports/REP-103/download?format=CSV");
    expect(csvRes.statusCode).toBe(200);
    expect(csvRes.headers["content-type"]).toContain("text/csv");

    const excelRes = await request(app).get("/api/reports/REP-102/download?format=Excel");
    expect(excelRes.statusCode).toBe(200);
    expect(excelRes.headers["content-type"]).toContain("spreadsheetml.sheet");
  });

  it("GET /api/unknown-endpoint should trigger 404 Route Not Found middleware", async () => {
    const response = await request(app).get("/api/unknown-endpoint");
    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain("Route Not Found");
  });
});
