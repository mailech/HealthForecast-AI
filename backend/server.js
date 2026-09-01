const path = require("path");
const dotenv = require("dotenv");

// Load .env explicitly
dotenv.config({ path: path.resolve(__dirname, ".env") });

console.log("⚡ Loaded BREVO_API_KEY:", process.env.BREVO_API_KEY ? "YES" : "NO");

const http = require("http");
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const { initSocket } = require("./socket");

// Route Handlers
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const patientRoutes = require("./routes/patientRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const alertRoutes = require("./routes/alertRoutes");
const auditRoutes = require("./routes/auditRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const reportRoutes = require("./routes/reportRoutes");

// Middleware
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();
const server = http.createServer(app);

// Connect MongoDB Database
connectDB();

// Initialize Socket.io WebSockets
initSocket(server);

// Global Middleware
app.use(cors());
app.use(express.json());

// Base Route
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "HealthForecast AI Backend, WebSockets & HIPAA Compliance API Operational",
    timestamp: new Date().toISOString(),
  });
});

// API Endpoint Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/prediction", predictionRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/reports", reportRoutes);

// Error Handling & 404 Fallback
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server, WebSockets & HIPAA Security API running on http://localhost:${PORT}`);
});