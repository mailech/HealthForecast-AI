const fs = require('fs');
const readline = require('readline');
const path = require('path');

// Candidate locations where diabetic_data.csv might be found
const DATASET_PATHS = [
  path.join(__dirname, '../data/diabetic_data.csv'),
  path.join(__dirname, '../diabetic_data.csv'),
  path.join(__dirname, '../../data/diabetic_data.csv'),
  path.join(__dirname, '../../diabetic_data.csv')
];

/**
 * Locate diabetic_data.csv file
 */
const getDatasetPath = () => {
  for (const p of DATASET_PATHS) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
};

// First names pool for realistic patient record generation
const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Donald', 'Sandra', 'Mark', 'Ashley',
  'Paul', 'Kimberly', 'Steven', 'Emily', 'Andrew', 'Donna', 'Kenneth', 'Michelle',
  'Joshua', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Melissa', 'George', 'Deborah',
  'Edward', 'Stephanie', 'Ronald', 'Rebecca', 'Timothy', 'Sharon', 'Jason', 'Laura',
  'Jeffrey', 'Cynthia', 'Ryan', 'Kathleen', 'Jacob', 'Amy', 'Gary', 'Shirley'
];

// Last names pool
const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker'
];

/**
 * Maps ICD-9 codes to readable clinical diagnosis descriptions
 */
const mapIcd9Diagnosis = (code) => {
  if (!code || code === '?') return 'Diabetes Mellitus';

  const num = parseFloat(code);
  if (code.startsWith('250') || (num >= 250 && num < 251)) {
    return 'Diabetes Mellitus (ICD9-250)';
  }
  if ((num >= 390 && num <= 459) || code.startsWith('785')) {
    if (num >= 410 && num <= 414) return 'Coronary Atherosclerosis / CAD (ICD9-414)';
    if (num === 428) return 'Congestive Heart Failure (ICD9-428)';
    if (num >= 401 && num <= 405) return 'Essential Hypertension (ICD9-401)';
    if (num >= 430 && num <= 438) return 'Cerebrovascular Disease / Stroke';
    return 'Circulatory System Disorder';
  }
  if ((num >= 460 && num <= 519) || code.startsWith('786')) {
    if (num === 486) return 'Pneumonia (ICD9-486)';
    if (num === 493) return 'Asthma Exacerbation (ICD9-493)';
    if (num === 491 || num === 492 || num === 496) return 'Chronic Obstructive Pulmonary Disease';
    return 'Respiratory System Disease';
  }
  if ((num >= 520 && num <= 579) || code.startsWith('787')) {
    return 'Digestive System Disorder';
  }
  if ((num >= 580 && num <= 629) || code.startsWith('788')) {
    if (num === 584 || num === 585) return 'Renal Insufficiency / CKD (ICD9-585)';
    return 'Genitourinary System Disorder';
  }
  if (num >= 680 && num <= 709) {
    return 'Cellulitis and Skin Infection';
  }
  if (num >= 710 && num <= 739) {
    return 'Musculoskeletal System Disorder';
  }
  if (num >= 800 && num <= 999) {
    return 'Injury / Trauma';
  }
  if (num >= 140 && num <= 239) {
    return 'Neoplasm / Oncology Finding';
  }
  return `Clinical Diagnosis (ICD9-${code})`;
};

/**
 * Standardize age groups from UCI notation e.g. [70-80) -> 70-80
 */
const formatAgeGroup = (ageStr) => {
  if (!ageStr) return '50-60';
  const clean = ageStr.replace(/[[\]()]/g, '').trim();
  return clean || '50-60';
};

/**
 * Standardize race entries
 */
const formatRace = (raceStr) => {
  if (!raceStr || raceStr === '?') return 'Other';
  if (raceStr === 'AfricanAmerican') return 'African American';
  return raceStr;
};

/**
 * Standardize discharge disposition
 */
const mapDischargeDisposition = (id) => {
  const code = parseInt(id, 10);
  if (code === 1) return 'Discharged to Home';
  if ([2, 3, 4, 5, 22, 23, 24].includes(code)) return 'Discharged to Rehab / Skilled Facility';
  if (code === 6) return 'Discharged to Home Care';
  if ([11, 19, 20, 21].includes(code)) return 'Expired / Hospice';
  return 'Discharged to Home';
};

/**
 * Standardize admission source
 */
const mapAdmissionSource = (id) => {
  const code = parseInt(id, 10);
  if (code === 7) return 'Emergency Room';
  if ([1, 2, 3].includes(code)) return 'Referral / Clinic';
  if ([4, 5, 6].includes(code)) return 'Transfer from Hospital';
  return 'Emergency Room';
};

/**
 * Handle missing values in weight (interval string or '?')
 * Parses intervals e.g. [75-100) -> 87.5 kg
 * If missing ('?'), sets weightWasMissing = true and applies clinical median imputation (75.0 kg)
 */
const parseAndImputeWeight = (weightStr) => {
  if (!weightStr || weightStr === '?' || weightStr.trim() === '') {
    return { weight: 75.0, weightWasMissing: true };
  }
  const clean = weightStr.replace(/[[\]()><]/g, '').trim();
  if (clean.includes('-')) {
    const parts = clean.split('-');
    const low = parseFloat(parts[0]);
    const high = parseFloat(parts[1]);
    if (!isNaN(low) && !isNaN(high)) {
      return { weight: (low + high) / 2.0, weightWasMissing: false };
    }
  }
  const num = parseFloat(clean);
  if (!isNaN(num)) {
    return { weight: num, weightWasMissing: false };
  }
  return { weight: 75.0, weightWasMissing: true };
};

/**
 * Handle missing values in payer_code via Mode Imputation ('MC')
 */
const imputePayerCode = (payerStr) => {
  if (!payerStr || payerStr === '?' || payerStr.trim() === '') {
    return 'MC'; // Mode imputation (Medicare is predominant in elderly diabetic encounters)
  }
  return payerStr.trim();
};

/**
 * Handle missing values in medical_specialty via Mode Imputation and diagnostic correlation
 */
const imputeMedicalSpecialty = (specialtyStr, primaryDiag) => {
  if (!specialtyStr || specialtyStr === '?' || specialtyStr.trim() === '') {
    if (primaryDiag && (primaryDiag.includes('CAD') || primaryDiag.includes('Heart') || primaryDiag.includes('Hypertension'))) {
      return 'Cardiology';
    }
    if (primaryDiag && (primaryDiag.includes('Renal') || primaryDiag.includes('CKD'))) {
      return 'Nephrology';
    }
    if (primaryDiag && (primaryDiag.includes('Respiratory') || primaryDiag.includes('Pneumonia') || primaryDiag.includes('Asthma'))) {
      return 'Pulmonology';
    }
    return 'InternalMedicine'; // Mode imputation
  }
  return specialtyStr.trim();
};

/**
 * Parse CSV line handling potential quotes and commas
 */
const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

/**
 * Stream-parse diabetic_data.csv into patient schema objects
 * @param {Object} options
 * @param {number} options.limit - Max records to parse (default 200)
 * @param {Array<string>} options.doctorIds - Doctor ObjectIds to assign
 * @returns {Promise<Array<Object>>}
 */
const parseDiabeticDataset = async (options = {}) => {
  const limit = options.limit || 200;
  const doctorIds = options.doctorIds || [];
  const datasetPath = getDatasetPath();

  if (!datasetPath) {
    throw new Error(`diabetic_data.csv not found in search paths: ${DATASET_PATHS.join(', ')}`);
  }

  const fileStream = fs.createReadStream(datasetPath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const patientMap = new Map();
  let headers = null;
  let headerMap = {};
  let lineCount = 0;

  for await (const line of rl) {
    if (!line || !line.trim()) continue;

    if (!headers) {
      headers = parseCSVLine(line);
      headers.forEach((h, idx) => {
        headerMap[h] = idx;
      });
      continue;
    }

    const cols = parseCSVLine(line);
    lineCount++;

    const patientNbr = cols[headerMap['patient_nbr']] || `NBR${lineCount}`;
    const encounterId = cols[headerMap['encounter_id']] || `ENC${lineCount}`;
    const race = formatRace(cols[headerMap['race']]);
    let gender = cols[headerMap['gender']] || 'Other';
    if (!['Male', 'Female'].includes(gender)) gender = 'Other';

    const ageGroup = formatAgeGroup(cols[headerMap['age']]);
    const timeInHospital = parseInt(cols[headerMap['time_in_hospital']], 10) || 3;
    const numLabProcedures = parseInt(cols[headerMap['num_lab_procedures']], 10) || 20;
    const numMedications = parseInt(cols[headerMap['num_medications']], 10) || 10;
    const numDiagnoses = parseInt(cols[headerMap['number_diagnoses']], 10) || 4;

    const diag1 = mapIcd9Diagnosis(cols[headerMap['diag_1']]);
    const diag2 = mapIcd9Diagnosis(cols[headerMap['diag_2']]);

    // Explicit missing value imputation ('?')
    const weightInfo = parseAndImputeWeight(cols[headerMap['weight']]);
    const payerCode = imputePayerCode(cols[headerMap['payer_code']]);
    const medicalSpecialty = imputeMedicalSpecialty(cols[headerMap['medical_specialty']], diag1);

    let maxGluSerum = cols[headerMap['max_glu_serum']];
    if (!['None', '>200', '>300', 'Norm'].includes(maxGluSerum)) maxGluSerum = 'None';

    let a1cResult = cols[headerMap['A1Cresult']];
    if (!['None', '>7', '>8', 'Norm'].includes(a1cResult)) a1cResult = 'None';

    const changeInMeds = cols[headerMap['change']] === 'Ch';
    const diabetesMed = cols[headerMap['diabetesMed']] === 'Yes';

    const readmittedVal = cols[headerMap['readmitted']] || 'NO';
    const isReadmitted = readmittedVal === '<30' || readmittedVal === '>30';
    const readmissionTime = readmittedVal === '<30' ? '<30 days' : (readmittedVal === '>30' ? '>30 days' : 'No');

    const dischargeDisposition = mapDischargeDisposition(cols[headerMap['discharge_disposition_id']]);
    const admissionSource = mapAdmissionSource(cols[headerMap['admission_source_id']]);

    // Choose random first and last name deterministically from encounter ID
    const encNum = parseInt(encounterId.replace(/\D/g, '') || `${lineCount}`, 10);
    const firstName = FIRST_NAMES[encNum % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(encNum * 7) % LAST_NAMES.length];

    // Assign doctor round-robin
    const assignedDoctor = doctorIds.length > 0 ? doctorIds[lineCount % doctorIds.length] : null;

    // Admission dates staggered over past 60 days
    const daysAgo = (lineCount % 60) + 2;
    const admissionDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const dischargeDate = new Date(admissionDate.getTime() + timeInHospital * 24 * 60 * 60 * 1000);

    const admissionRecord = {
      admissionId: `ADM-${encounterId.slice(-6).padStart(6, '0')}`,
      admissionSource,
      timeInHospital,
      numLabProcedures,
      numMedications,
      numDiagnoses,
      primaryDiagnosis: diag1,
      secondaryDiagnosis: diag2,
      payerCode,
      medicalSpecialty,
      weight: weightInfo.weight,
      weightWasMissing: weightInfo.weightWasMissing,
      maxGluSerum,
      a1cResult,
      changeInMeds,
      diabetesMed,
      dischargeDisposition,
      admissionDate,
      dischargeDate
    };

    if (patientMap.has(patientNbr)) {
      const existing = patientMap.get(patientNbr);
      existing.admissionHistory.push(admissionRecord);
      if (isReadmitted) {
        existing.isReadmitted = true;
        existing.readmissionTime = readmissionTime;
      }
    } else {
      const chronicConditions = ['Type 2 Diabetes'];
      if (diag1.includes('Heart') || diag1.includes('Hypertension') || diag2.includes('Heart')) {
        chronicConditions.push('Hypertension');
      }
      if (diag1.includes('Renal') || diag2.includes('Renal')) {
        chronicConditions.push('Chronic Kidney Disease');
      }
      if (diag1.includes('Respiratory') || diag2.includes('Asthma')) {
        chronicConditions.push('Asthma / COPD');
      }

      const patientRecord = {
        patientId: `PT-${patientNbr.slice(-6).padStart(6, '0')}`,
        firstName,
        lastName,
        ageGroup,
        gender,
        race,
        assignedDoctor,
        medicalHistory: {
          allergies: (lineCount % 3 === 0) ? ['Penicillin'] : (lineCount % 5 === 0 ? ['Sulfa'] : []),
          chronicConditions
        },
        admissionHistory: [admissionRecord],
        isReadmitted,
        readmissionTime
      };

      patientMap.set(patientNbr, patientRecord);
    }

    if (patientMap.size >= limit) {
      break;
    }
  }

  return Array.from(patientMap.values());
};

/**
 * Get basic stats about the dataset file without loading all rows into memory
 */
const getDatasetStats = async () => {
  const datasetPath = getDatasetPath();
  if (!datasetPath) {
    return { available: false, error: 'Dataset file not found' };
  }

  const fileStats = fs.statSync(datasetPath);
  return {
    available: true,
    fileName: 'diabetic_data.csv',
    filePath: datasetPath,
    sizeBytes: fileStats.size,
    sizeMB: (fileStats.size / (1024 * 1024)).toFixed(2),
    estimatedRows: 101768,
    featuresCount: 50,
    datasetSource: 'UCI Machine Learning Repository: Diabetes 130-US Hospitals (1999-2008)'
  };
};

module.exports = {
  getDatasetPath,
  parseDiabeticDataset,
  getDatasetStats,
  mapIcd9Diagnosis
};
