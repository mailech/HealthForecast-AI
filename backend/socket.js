const { Server } = require("socket.io");
const Alert = require("./models/Alert");

let io;

const PATIENTS_TELEMETRY = [
  { id: 1, name: "Rahul Verma", age: 61, disease: "Heart Disease" },
  { id: 2, name: "Ramesh Kumar", age: 52, disease: "Diabetes" },
  { id: 3, name: "Priya Sharma", age: 43, disease: "Hypertension" },
];

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`⚡ Client connected to WebSockets: ${socket.id}`);

    // Send initial handshake state
    socket.emit("system_status", {
      status: "connected",
      message: "HealthForecast AI Real-Time Telemetry Socket Active",
      timestamp: new Date().toISOString(),
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected from WebSockets: ${socket.id}`);
    });
  });

  // Start Real-Time Vitals & Alert Telemetry Engine
  startVitalsTelemetry(io);

  return io;
}

function startVitalsTelemetry(io) {
  setInterval(async () => {
    try {
      // Pick a random patient
      const patient = PATIENTS_TELEMETRY[Math.floor(Math.random() * PATIENTS_TELEMETRY.length)];

      // Generate realistic vitals telemetry
      const heartRate = Math.floor(Math.random() * 45) + 70; // 70 - 115 bpm
      const spO2 = Math.floor(Math.random() * 10) + 90; // 90 - 99%
      const sysBP = Math.floor(Math.random() * 50) + 115; // 115 - 165 mmHg
      const diaBP = Math.floor(Math.random() * 25) + 75; // 75 - 100 mmHg
      const glucose = Math.floor(Math.random() * 120) + 100; // 100 - 220 mg/dL

      const vitalsData = {
        patientId: patient.id,
        patientName: patient.name,
        disease: patient.disease,
        heartRate,
        spO2,
        bp: `${sysBP}/${diaBP}`,
        glucose,
        timestamp: new Date().toISOString(),
      };

      // Broadcast live vitals stream to all connected sockets
      io.emit("vitals_update", vitalsData);

      // Check for clinical threshold breach triggers
      let breachSeverity = null;
      let breachMessage = null;

      if (spO2 < 92) {
        breachSeverity = "Critical";
        breachMessage = `Oxygen Saturation (SpO2) dropped to ${spO2}% (Below 92% limit).`;
      } else if (sysBP >= 155) {
        breachSeverity = "Critical";
        breachMessage = `Systolic Blood Pressure spiked to ${sysBP}/${diaBP} mmHg.`;
      } else if (heartRate >= 110) {
        breachSeverity = "Warning";
        breachMessage = `Tachycardia detected: Heart Rate reached ${heartRate} bpm.`;
      } else if (glucose >= 200) {
        breachSeverity = "Warning";
        breachMessage = `Hyperglycemic spike detected: Fasting Glucose at ${glucose} mg/dL.`;
      }

      // If breach detected, persist to MongoDB and broadcast alert_breach event
      if (breachSeverity && breachMessage) {
        const newAlert = await Alert.create({
          patient: patient.name,
          message: breachMessage,
          severity: breachSeverity,
          status: "Active",
          isRead: false,
        });

        console.log(`🚨 BREACH ALERT TRIGGERED: ${patient.name} - ${breachMessage}`);

        io.emit("alert_breach", {
          id: newAlert._id,
          patient: newAlert.patient,
          message: newAlert.message,
          severity: newAlert.severity,
          status: newAlert.status,
          time: "Just now",
          vitals: vitalsData,
          createdAt: newAlert.createdAt,
        });
      }
    } catch (err) {
      console.error("Telemetry generator error:", err.message);
    }
  }, 30000); // Telemetry tick every 30 seconds
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io has not been initialized!");
  }
  return io;
}

module.exports = { initSocket, getIO };
