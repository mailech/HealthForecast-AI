const fs = require("fs");
const path = require("path");
const readline = require("readline");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) { }

// Load Environment Variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const Patient = require("../src/models/Patient");

const diabeticDataCsvPath = path.join(__dirname, "../data/diabetic_data.csv");
const datasetCsvPath = path.join(__dirname, "../data/dataset.csv");

// Resolve clinical CSV file path (prefer diabetic_data.csv directly)
function getClinicalCsvPath() {
  if (fs.existsSync(diabeticDataCsvPath)) {
    return diabeticDataCsvPath;
  }
  if (fs.existsSync(datasetCsvPath)) {
    return datasetCsvPath;
  }
  console.error("Error: Clinical dataset file (diabetic_data.csv or dataset.csv) not found in backend/data/");
  process.exit(1);
}

// Lists for generating realistic synthetic names
const firstNames = [
  "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
  "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
  "Matthew", "Betty", "Anthony", "Margaret", "Donald", "Sandra", "Aarav", "Priya",
  "Ramesh", "Sneha", "Vikram", "Ananya", "Rohan", "Kavita", "Sanjay", "Deepika"
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Sharma", "Verma", "Patel",
  "Singh", "Kumar", "Gupta", "Reddy", "Nair", "Joshi", "Chowdhury"
];

function generateSyntheticName(patientNbr, index) {
  const seed = (parseInt(patientNbr, 10) || index) + index * 13;
  const firstName = firstNames[seed % firstNames.length];
  const lastName = lastNames[(seed * 7) % lastNames.length];
  return `${firstName} ${lastName}`;
}

function parseAge(ageStr) {
  if (!ageStr) return 55;
  // Format like [50-60)
  const match = ageStr.match(/\[(\d+)-(\d+)\)/);
  if (match) {
    const low = parseInt(match[1], 10);
    const high = parseInt(match[2], 10);
    return Math.round((low + high) / 2);
  }
  const num = parseInt(ageStr, 10);
  return isNaN(num) ? 55 : Math.max(18, Math.min(95, num));
}

function parseGender(genderStr) {
  if (!genderStr) return "Male";
  const g = genderStr.trim().toLowerCase();
  if (g.startsWith("f")) return "Female";
  if (g.startsWith("m")) return "Male";
  return "Other";
}

function mapICDToDisease(diag1, diag2, diag3) {
  const codes = [diag1, diag2, diag3].filter(Boolean);
  for (const code of codes) {
    if (code.startsWith("250")) return "Type 2 Diabetes";
    if (code.startsWith("428") || code.startsWith("414")) return "Congestive Heart Failure (CHF)";
    if (code.startsWith("490") || code.startsWith("491") || code.startsWith("492") || code.startsWith("496")) {
      return "Chronic Obstructive Pulmonary Disease (COPD)";
    }
    if (code.startsWith("401") || code.startsWith("402") || code.startsWith("403")) return "Hypertension";
    if (code.startsWith("585") || code.startsWith("580") || code.startsWith("581")) return "Chronic Kidney Disease";
    if (code.startsWith("430") || code.startsWith("431") || code.startsWith("434")) return "Cerebrovascular Disease";
  }
  return "Type 2 Diabetes";
}

function calculateVitalsAndRisk(row, age) {
  const numInpatient = parseInt(row.number_inpatient, 10) || 0;
  const numEmergency = parseInt(row.number_emergency, 10) || 0;
  const numLab = parseInt(row.num_lab_procedures, 10) || 0;
  const numMeds = parseInt(row.num_medications, 10) || 0;
  const numDiags = parseInt(row.number_diagnoses, 10) || 0;
  const readmitted = (row.readmitted || "").trim();

  // Glucose calculation
  let glucose = 115;
  if (row.max_glu_serum === ">300") glucose = 310;
  else if (row.max_glu_serum === ">200") glucose = 215;
  else if (row.max_glu_serum === "norm") glucose = 105;
  else if (row.A1Cresult === ">8") glucose = 210;
  else if (row.A1Cresult === ">7") glucose = 165;

  // Blood Pressure calculation
  let sys = 120 + Math.min(35, Math.floor(age / 2)) + (numInpatient > 0 ? 10 : 0);
  let dia = 78 + Math.min(18, Math.floor(age / 4));
  const bp = `${sys}/${dia}`;

  // Heart Rate & SpO2
  const heartRate = Math.min(105, Math.max(62, 72 + numEmergency * 4 + (numInpatient > 1 ? 8 : 0)));
  const spO2 = Math.max(88, Math.min(99, 98 - (numInpatient > 0 ? 2 : 0) - (numDiags > 6 ? 1 : 0)));
  const bmi = Math.round((24.5 + (numMeds * 0.3) + (age > 60 ? 1.5 : 0)) * 10) / 10;

  // Multi-factor Risk Score (0 - 100)
  let score = 20;
  if (readmitted === "<30") score += 38;
  else if (readmitted === ">30") score += 18;

  score += Math.min(24, numInpatient * 8);
  score += Math.min(18, numEmergency * 6);
  if (numLab > 50) score += 8;
  if (numMeds > 12) score += 8;
  if (numDiags > 6) score += 6;
  if (age > 65) score += 6;

  score = Math.min(98, Math.max(15, score));

  let risk = "Low";
  let riskCategory = "LOW";
  if (score >= 70) {
    risk = "High";
    riskCategory = "HIGH";
  } else if (score >= 40) {
    risk = "Medium";
    riskCategory = "MEDIUM";
  }

  const previousAdmissions = numInpatient + numEmergency;
  const status = (readmitted === "<30" || numInpatient > 0) ? "Active" : "Discharged";

  return {
    glucose,
    bp,
    bloodPressure: bp,
    heartRate,
    oxygenSaturation: spO2,
    spO2,
    bmi,
    previousAdmissions,
    riskScore: score,
    risk,
    riskCategory,
    status,
  };
}

// Simple CSV parser for header and row lines
function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function seedDataset() {
  const targetCsvPath = getClinicalCsvPath();
  console.log(`Reading clinical dataset directly from: ${targetCsvPath}`);

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("Error: MONGO_URI or MONGODB_URI environment variable is required.");
    process.exit(1);
  }
  console.log("Connecting to MongoDB for dataset seeding...");
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
  console.log("Connected to MongoDB successfully.");

  // Clear existing Patient records
  await Patient.deleteMany({});
  console.log("Cleared existing patient records from database.");

  const fileStream = fs.createReadStream(targetCsvPath, { encoding: "utf8" });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let headers = null;
  let batch = [];
  let totalProcessed = 0;
  let totalSaved = 0;
  const BATCH_SIZE = 2000;

  console.log("Starting CSV streaming & patient record parsing...");
  const startTime = Date.now();

  for await (const line of rl) {
    if (!line || !line.trim()) continue;

    if (!headers) {
      headers = parseCsvLine(line);
      continue;
    }

    const values = parseCsvLine(line);
    if (values.length < headers.length) continue;

    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx];
    });

    totalProcessed++;

    const patientNbr = row.patient_nbr || totalProcessed;
    const name = generateSyntheticName(patientNbr, totalProcessed);
    const age = parseAge(row.age);
    const gender = parseGender(row.gender);
    const disease = mapICDToDisease(row.diag_1, row.diag_2, row.diag_3);
    const vitalsAndRisk = calculateVitalsAndRisk(row, age);

    const patientDoc = {
      name,
      age,
      gender,
      disease,
      risk: vitalsAndRisk.risk,
      riskScore: vitalsAndRisk.riskScore,
      riskCategory: vitalsAndRisk.riskCategory,
      status: vitalsAndRisk.status,
      photo: `https://i.pravatar.cc/150?img=${(totalProcessed % 70) + 1}`,
      previousAdmissions: vitalsAndRisk.previousAdmissions,
      nationalId: `PHI-SEC-${String(patientNbr).padStart(8, "0")}`,
      medicalHistoryNotes: `Primary ICD-9: ${row.diag_1 || "N/A"}. Admission time: ${row.time_in_hospital || 1} days. Labs: ${row.num_lab_procedures || 0}, Meds: ${row.num_medications || 0}, Readmit status: ${row.readmitted || "NO"}.`,
      vitals: {
        glucose: vitalsAndRisk.glucose,
        bp: vitalsAndRisk.bp,
        bloodPressure: vitalsAndRisk.bloodPressure,
        heartRate: vitalsAndRisk.heartRate,
        oxygenSaturation: vitalsAndRisk.oxygenSaturation,
        spO2: vitalsAndRisk.spO2,
        bmi: vitalsAndRisk.bmi,
        previousAdmissions: vitalsAndRisk.previousAdmissions,
      },
    };

    batch.push(patientDoc);

    if (batch.length >= BATCH_SIZE) {
      await Patient.insertMany(batch, { ordered: false });
      totalSaved += batch.length;
      console.log(`Ingested ${totalSaved} / ${totalProcessed} patient records...`);
      batch = [];
    }
  }

  if (batch.length > 0) {
    await Patient.insertMany(batch, { ordered: false });
    totalSaved += batch.length;
    batch = [];
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✅ DATASET SEEDING COMPLETE!`);
  console.log(`Processed: ${totalProcessed} records`);
  console.log(`Successfully Saved: ${totalSaved} patients to MongoDB`);
  console.log(`Execution Time: ${duration} seconds`);

  await mongoose.disconnect();
  process.exit(0);
}

seedDataset().catch((err) => {
  console.error("Fatal Error Seeding Dataset:", err);
  process.exit(1);
});
