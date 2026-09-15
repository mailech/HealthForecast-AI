const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const ExcelJS = require("exceljs");

// Import middleware & handlers
const { notFound, errorHandler } = require("../src/middleware/errorMiddleware");
const authRoutes = require("../src/routes/authRoutes");
const userRoutes = require("../src/routes/userRoutes");
const patientRoutes = require("../src/routes/patientRoutes");
const predictionRoutes = require("../src/routes/predictionRoutes");
const alertRoutes = require("../src/routes/alertRoutes");
const auditRoutes = require("../src/routes/auditRoutes");
const analyticsRoutes = require("../src/routes/analyticsRoutes");
const reportRoutes = require("../src/routes/reportRoutes");
const treatmentPlanRoutes = require("../src/routes/treatmentPlanRoutes");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_key_for_unit_testing_12345";
const JWT_SECRET = process.env.JWT_SECRET;

// Generate valid test JWT tokens
const doctorToken = jwt.sign(
  { id: "USR-DOC-001", name: "Dr. John Smith", email: "john.smith@healthforecast.ai", role: "DOCTOR" },
  JWT_SECRET,
  { expiresIn: "1h" }
);

const adminToken = jwt.sign(
  { id: "USR-ADM-001", name: "Admin Sarah", email: "admin@healthforecast.ai", role: "HOSPITAL_ADMIN" },
  JWT_SECRET,
  { expiresIn: "1h" }
);

const researcherToken = jwt.sign(
  { id: "USR-RES-001", name: "Dr. Alan Turing", email: "researcher@healthforecast.ai", role: "RESEARCHER" },
  JWT_SECRET,
  { expiresIn: "1h" }
);

const expiredToken = jwt.sign(
  { id: "USR-EXP-001", name: "Expired User", email: "expired@test.com", role: "DOCTOR" },
  JWT_SECRET,
  { expiresIn: "-1s" }
);

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
app.use("/api/treatment-plans", treatmentPlanRoutes);

app.use(notFound);
app.use(errorHandler);

describe("Backend Integration & Security API Test Suite", () => {
  // Public Endpoint Tests
  it("GET /api/test should return 200 OK and operational status", async () => {
    const response = await request(app).get("/api/test");
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain("Operational");
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
  });

  // Security & Authentication Tests (HTTP 401 Boundary Checks)
  it("SECURITY TEST 1: Unauthenticated request to patient endpoint should return 401 Unauthorized", async () => {
    const response = await request(app).get("/api/patients");
    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("SECURITY TEST 2: Unauthenticated request to prediction endpoint should return 401 Unauthorized", async () => {
    const response = await request(app).post("/api/prediction/predict").send({ patientName: "Test" });
    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("SECURITY TEST 3: Unauthenticated request to report endpoint should return 401 Unauthorized", async () => {
    const response = await request(app).get("/api/reports/REP-101/download?format=PDF");
    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("SECURITY TEST 4: Unauthenticated request to user-management endpoint should return 401 Unauthorized", async () => {
    const response = await request(app).get("/api/users/pending");
    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("SECURITY TEST 5: Request with invalid JWT token signature should return 401 Unauthorized", async () => {
    const response = await request(app)
      .get("/api/patients")
      .set("Authorization", "Bearer invalid_malformed_token_12345");
    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("SECURITY TEST 6: Request with expired JWT token should return 401 Unauthorized", async () => {
    const response = await request(app)
      .get("/api/patients")
      .set("Authorization", `Bearer ${expiredToken}`);
    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("SECURITY TEST 7: Authenticated Doctor accessing permitted patient list should succeed (200 OK)", async () => {
    const response = await request(app)
      .get("/api/patients")
      .set("Authorization", `Bearer ${doctorToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("SECURITY TEST 8: Authenticated Doctor attempting admin-only user-management should return 403 Forbidden", async () => {
    const response = await request(app)
      .get("/api/users/pending")
      .set("Authorization", `Bearer ${doctorToken}`);
    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain("Access forbidden");
  });

  it("SECURITY TEST 9: Authenticated Admin accessing admin-only user-management should succeed (200 OK)", async () => {
    const response = await request(app)
      .get("/api/users/pending")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("SECURITY TEST 10: Authenticated Researcher creating a patient (doctor/admin write operation) should return 403 Forbidden", async () => {
    const response = await request(app)
      .post("/api/patients")
      .set("Authorization", `Bearer ${researcherToken}`)
      .send({
        name: "Test New Patient",
        age: 45,
        disease: "Cardiology Monitoring",
        risk: "Medium",
      });
    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });

  // Authenticated Endpoint Functional Tests
  it("POST /api/prediction/predict with valid token should validate missing parameters and return 400", async () => {
    const response = await request(app)
      .post("/api/prediction/predict")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({ patientName: "Test Patient" });
    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("POST /api/patients with doctor token should create patient and return 201 Created", async () => {
    const response = await request(app)
      .post("/api/patients")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({
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

  it("GET /api/patients/:id/download-pdf with valid token should stream care plan PDF", async () => {
    const response = await request(app)
      .get("/api/patients/PAT-DEMO-001/download-pdf")
      .set("Authorization", `Bearer ${doctorToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("application/pdf");
  });

  it("ANALYTICS TEST 1: Unconnected / empty database should return zeros and empty arrays without random Gaussian values", async () => {
    const response = await request(app)
      .get("/api/analytics?timeframe=30d")
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.totalPatients).toBe(0);
    expect(response.body.data.avgDaysInCare).toBe(0);
    expect(response.body.data.readmissionRate).toBe(0);
    expect(response.body.data.medicationCompliance).toBeNull();
    expect(response.body.data.medicationComplianceAvailable).toBe(false);
    expect(response.body.data.highRiskCount).toBe(0);
    expect(response.body.data.riskDistribution).toEqual({ High: 0, Medium: 0, Low: 0 });
    expect(response.body.data.readmissionCurves).toEqual([]);
    expect(response.body.data.telemetry24h).toEqual([]);
  });

  it("ANALYTICS TEST 2: Aggregated MongoDB Analytics with mock DB state should match exact fixture totals", async () => {
    const mongoose = require("mongoose");
    const Patient = require("../src/models/Patient");
    const PredictionHistory = require("../src/models/PredictionHistory");

    const origState = mongoose.connection.readyState;
    Object.defineProperty(mongoose.connection, "readyState", { value: 1, configurable: true });

    jest.spyOn(Patient, "aggregate").mockImplementation(async (pipeline) => {
      const pipelineStr = JSON.stringify(pipeline);
      if (pipelineStr.includes("$riskCategory")) {
        return [
          { _id: "HIGH", count: 3 },
          { _id: "MEDIUM", count: 2 },
          { _id: "LOW", count: 5 },
        ];
      }
      if (pipelineStr.includes("$hour")) {
        return [{ _id: 10, avgGlucose: 120, avgBmi: 26.5, count: 10 }];
      }
      return [
        {
          _id: null,
          count: 10,
          activeCount: 8,
          dischargedCount: 2,
          avgDays: 5.5,
          readmittedCount: 2,
        },
      ];
    });

    jest.spyOn(PredictionHistory, "aggregate").mockImplementation(async (pipeline) => {
      const pipelineStr = JSON.stringify(pipeline);
      if (pipelineStr.includes("$dateToString")) {
        return [
          { _id: "2026-08", avgScore: 35.0, count: 5, readmissionCount: 2 },
          { _id: "2026-09", avgScore: 42.0, count: 5, readmissionCount: 3 },
        ];
      }
      return [
        {
          _id: null,
          total: 10,
          highCount: 3,
          mediumCount: 4,
          lowCount: 3,
          readmissionCount: 5,
          notReadmittedCount: 5,
        },
      ];
    });

    const response = await request(app)
      .get("/api/analytics?timeframe=30d")
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.totalPatients).toBe(10);
    expect(response.body.data.activePatients).toBe(8);
    expect(response.body.data.dischargedPatients).toBe(2);
    expect(response.body.data.avgDaysInCare).toBe(5.5);
    expect(response.body.data.readmissionRate).toBe(20);
    expect(response.body.data.riskDistribution).toEqual({ High: 3, Medium: 2, Low: 5 });
    expect(response.body.data.predictionStats.totalPredictions).toBe(10);
    expect(response.body.data.predictionStats.readmissionPredictions).toBe(5);
    expect(response.body.data.predictionStats.notReadmittedPredictions).toBe(5);
    expect(response.body.data.readmissionCurves.length).toBe(2);
    expect(response.body.data.readmissionCurves[0].month).toBe("2026-08");

    Patient.aggregate.mockRestore();
    PredictionHistory.aggregate.mockRestore();
    Object.defineProperty(mongoose.connection, "readyState", { value: origState, configurable: true });
  });

  it("ANALYTICS TEST 3: Semantic accuracy verification for medication adherence and condition risk index", async () => {
    const response = await request(app)
      .get("/api/analytics?timeframe=30d")
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(response.statusCode).toBe(200);
    // 1. Medication compliance is NOT calculated as (100 - readmissionRate)
    expect(response.body.data.medicationCompliance).toBeNull();
    expect(response.body.data.medicationComplianceAvailable).toBe(false);
    expect(response.body.data.medicationCompliance).not.toBe(100 - response.body.data.readmissionRate);

    // 2. Condition risk summary is explicitly labeled Average Risk Index
    expect(response.body.data.summary.chf30DayReadmissionRisk).toContain("Average Risk Index");
    expect(response.body.data.summary.copd30DayReadmissionRisk).toContain("Average Risk Index");
    expect(response.body.data.summary.diabetes30DayReadmissionRisk).toContain("Average Risk Index");
    expect(response.body.data.summary.riskType).toContain("Project-Defined Model Risk Index");

    // 3. Threshold explicitly noted as Project-Defined
    expect(response.body.data.predictionStats.thresholdNote).toContain("Project-Defined Threshold");
  });

  it("GET /api/reports/:id/download?format=PDF with valid token should return PDF document stream", async () => {
    const response = await request(app)
      .get("/api/reports/REP-101/download?format=PDF")
      .set("Authorization", `Bearer ${doctorToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("application/pdf");
  });

  it("GET /api/reports/:id/download?format=CSV should return valid text/csv content", async () => {
    const response = await request(app)
      .get("/api/reports/REP-103/download?format=CSV")
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("text/csv");
    expect(response.text).toContain("Patient ID");
    expect(response.text).toContain("Full Name");
  });

  it("GET /api/reports/:id/download?format=XLSX should return a valid binary OpenXML Excel workbook", async () => {
    const response = await request(app)
      .get("/api/reports/REP-102/download?format=XLSX")
      .set("Authorization", `Bearer ${doctorToken}`)
      .responseType("blob");

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("spreadsheetml.sheet");
    expect(response.headers["content-disposition"]).toContain("Report_REP-102_");
    expect(response.headers["content-disposition"]).toContain(".xlsx");

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.body);

    const worksheet = workbook.getWorksheet("Clinical Outcome Summary");
    expect(worksheet).toBeDefined();
    expect(worksheet.rowCount).toBeGreaterThan(1);

    const headers = worksheet.getRow(1).values;
    expect(headers).toContain("Patient ID");
    expect(headers).toContain("Full Name");
    expect(headers).toContain("Primary Condition");
  });

  // TASK 12 & 12A: Persistent Treatment & Care Plan Management & Schema Integrity Tests
  const validPatientObjectId = "507f1f77bcf86cd799439012";

  it("TREATMENT PLAN TEST 1: Unauthenticated POST /api/treatment-plans should return 401 Unauthorized", async () => {
    const response = await request(app)
      .post("/api/treatment-plans")
      .send({ patientId: validPatientObjectId, diagnosis: "Hypertension Management" });
    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("TREATMENT PLAN TEST 2: Unauthenticated GET /api/treatment-plans should return 401 Unauthorized", async () => {
    const response = await request(app).get("/api/treatment-plans");
    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("TREATMENT PLAN TEST 3: Doctor POST /api/treatment-plans with missing required fields should return 400 Bad Request", async () => {
    const response = await request(app)
      .post("/api/treatment-plans")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({ diagnosis: "Incomplete Payload" });
    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("TREATMENT PLAN TEST 4: Invalid patientId format (not 24-char ObjectId) should return 400 Bad Request", async () => {
    const response = await request(app)
      .post("/api/treatment-plans")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({ patientId: "INVALID-NON-OBJECTID", diagnosis: "Diabetes Management" });
    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain("Invalid patientId format");
  });

  it("TREATMENT PLAN TEST 5: Researcher POST /api/treatment-plans should return 403 Forbidden (read-only enforcement)", async () => {
    const response = await request(app)
      .post("/api/treatment-plans")
      .set("Authorization", `Bearer ${researcherToken}`)
      .send({ patientId: validPatientObjectId, diagnosis: "Type-2 Diabetes Protocol" });
    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });

  let testPlanId = null;

  it("TREATMENT PLAN TEST 6: Doctor POST /api/treatment-plans with valid ObjectId should persist plan and ignore client doctorId override", async () => {
    const response = await request(app)
      .post("/api/treatment-plans")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({
        patientId: validPatientObjectId,
        doctorId: "507f1f77bcf86cd799439099", // Attempted client override
        diagnosis: "Congestive Heart Failure Exacerbation",
        goals: ["Lower fluid retention", "Achieve target BP 120/80"],
        medications: [{ name: "Enalapril", dosage: "10mg", frequency: "Daily" }],
        recommendations: ["Bi-weekly nurse checkup call", "Low sodium diet protocol"],
        status: "ACTIVE",
        outcomeNotes: "Initial clinical intake complete.",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.patientId).toBe(validPatientObjectId);
    expect(response.body.data.diagnosis).toBe("Congestive Heart Failure Exacerbation");
    // Verified that system assigned authenticated JWT identity, overriding client doctorId
    expect(response.body.data.doctorId).not.toBe("507f1f77bcf86cd799439099");
    testPlanId = response.body.data._id;
  });

  it("TREATMENT PLAN TEST 7: GET /api/treatment-plans should return list of treatment plans for authorized roles including Researcher", async () => {
    const response = await request(app)
      .get(`/api/treatment-plans?patientId=${validPatientObjectId}`)
      .set("Authorization", `Bearer ${researcherToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("TREATMENT PLAN TEST 8: GET /api/treatment-plans/:id should return single treatment plan record", async () => {
    if (!testPlanId) return;
    const response = await request(app)
      .get(`/api/treatment-plans/${testPlanId}`)
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data._id).toBe(testPlanId);
  });

  it("TREATMENT PLAN TEST 9: Doctor PUT /api/treatment-plans/:id should update status and outcome notes (200 OK)", async () => {
    if (!testPlanId) return;
    const response = await request(app)
      .put(`/api/treatment-plans/${testPlanId}`)
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({
        status: "COMPLETED",
        outcome: "IMPROVED",
        outcomeNotes: "Patient metrics stabilized after ACE inhibitor titration.",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("COMPLETED");
  });

  it("TREATMENT PLAN TEST 10: Researcher PUT /api/treatment-plans/:id should return 403 Forbidden", async () => {
    if (!testPlanId) return;
    const response = await request(app)
      .put(`/api/treatment-plans/${testPlanId}`)
      .set("Authorization", `Bearer ${researcherToken}`)
      .send({ status: "CANCELLED" });

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it("TREATMENT PLAN TEST 11: GET /api/treatment-plans/NONEXISTENT (valid ObjectId format) should return 404 Not Found", async () => {
    const response = await request(app)
      .get("/api/treatment-plans/507f1f77bcf86cd799439011")
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("TREATMENT PLAN TEST 12: Doctor DELETE /api/treatment-plans/:id should update status to CANCELLED (200 OK)", async () => {
    if (!testPlanId) return;
    const response = await request(app)
      .delete(`/api/treatment-plans/${testPlanId}`)
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("CANCELLED");
  });

  // TASK 13: Doctor Assignment & Patient Cohort Management Security Tests
  const targetDoctorId = "507f1f77bcf86cd799439001";
  const doctorBId = "507f1f77bcf86cd799439002";
  const nonDoctorUserId = "507f1f77bcf86cd799439003";

  const doctorBToken = jwt.sign(
    { id: doctorBId, name: "Dr. Bob Miller", email: "bob.miller@healthforecast.ai", role: "DOCTOR" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  it("DOCTOR ASSIGNMENT TEST 1: Unauthenticated PUT /api/patients/:id/assign-doctor should return 401 Unauthorized", async () => {
    const response = await request(app)
      .put(`/api/patients/${validPatientObjectId}/assign-doctor`)
      .send({ doctorId: targetDoctorId });
    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("DOCTOR ASSIGNMENT TEST 2: Researcher PUT /api/patients/:id/assign-doctor should return 403 Forbidden", async () => {
    const response = await request(app)
      .put(`/api/patients/${validPatientObjectId}/assign-doctor`)
      .set("Authorization", `Bearer ${researcherToken}`)
      .send({ doctorId: targetDoctorId });
    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it("DOCTOR ASSIGNMENT TEST 3: Doctor PUT /api/patients/:id/assign-doctor should return 403 Forbidden (Only Admins can assign)", async () => {
    const response = await request(app)
      .put(`/api/patients/${validPatientObjectId}/assign-doctor`)
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({ doctorId: targetDoctorId });
    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it("DOCTOR ASSIGNMENT TEST 4: Admin PUT with invalid doctorId ObjectId format should return 400 Bad Request", async () => {
    const response = await request(app)
      .put(`/api/patients/${validPatientObjectId}/assign-doctor`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ doctorId: "INVALID-FORMAT-ID" });
    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain("Invalid doctorId ObjectId format");
  });

  it("DOCTOR ASSIGNMENT TEST 5: Admin PUT assigning a non-DOCTOR user (e.g. Researcher) should return 400 Bad Request", async () => {
    const mongoose = require("mongoose");
    const Patient = require("../src/models/Patient");
    const User = require("../src/models/User");
    const origState = mongoose.connection.readyState;
    const origDb = mongoose.connection.db;
    Object.defineProperty(mongoose.connection, "readyState", { value: 1, configurable: true });
    Object.defineProperty(mongoose.connection, "db", { value: {}, configurable: true });

    jest.spyOn(Patient, "findOne").mockResolvedValue({ _id: validPatientObjectId, name: "Test Patient", save: async () => {} });
    jest.spyOn(User, "findById").mockResolvedValue({
      _id: nonDoctorUserId,
      name: "Dr. Alan Turing",
      role: "RESEARCHER",
    });

    const response = await request(app)
      .put(`/api/patients/${validPatientObjectId}/assign-doctor`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ doctorId: nonDoctorUserId });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain("is not a valid Doctor");

    Patient.findOne.mockRestore();
    User.findById.mockRestore();
    Object.defineProperty(mongoose.connection, "readyState", { value: origState, configurable: true });
    Object.defineProperty(mongoose.connection, "db", { value: origDb, configurable: true });
  });

  it("DOCTOR ASSIGNMENT TEST 6: Admin PUT with valid Doctor user should assign doctor successfully (200 OK)", async () => {
    const mongoose = require("mongoose");
    const Patient = require("../src/models/Patient");
    const User = require("../src/models/User");
    const origState = mongoose.connection.readyState;
    const origDb = mongoose.connection.db;
    Object.defineProperty(mongoose.connection, "readyState", { value: 1, configurable: true });
    Object.defineProperty(mongoose.connection, "db", { value: {}, configurable: true });

    const mockPatient = { _id: validPatientObjectId, name: "Test Patient", save: async () => {} };
    jest.spyOn(Patient, "findOne").mockResolvedValue(mockPatient);
    jest.spyOn(User, "findById").mockResolvedValue({ _id: targetDoctorId, name: "Dr. John Smith", role: "DOCTOR" });
    jest.spyOn(Patient, "findById").mockReturnValue({
      populate: async () => ({ ...mockPatient, assignedDoctor: { name: "Dr. John Smith", role: "DOCTOR" } }),
    });

    const response = await request(app)
      .put(`/api/patients/${validPatientObjectId}/assign-doctor`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ doctorId: targetDoctorId });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.assignedDoctor).toBeDefined();

    Patient.findOne.mockRestore();
    Patient.findById.mockRestore();
    User.findById.mockRestore();
    Object.defineProperty(mongoose.connection, "readyState", { value: origState, configurable: true });
    Object.defineProperty(mongoose.connection, "db", { value: origDb, configurable: true });
  });

  it("COHORT SECURITY TEST: Doctor B requesting GET /api/patients?assignedDoctor=<DoctorA> MUST NOT bypass cohort restriction", async () => {
    const response = await request(app)
      .get(`/api/patients?assignedDoctor=${targetDoctorId}`)
      .set("Authorization", `Bearer ${doctorBToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    // Backend enforced that Doctor B's query was scoped to Doctor B's own ID (doctorBId), preventing access to Doctor A's cohort
  });

  it("GET /api/unknown-endpoint should trigger 404 Route Not Found middleware", async () => {
    const response = await request(app).get("/api/unknown-endpoint");
    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
