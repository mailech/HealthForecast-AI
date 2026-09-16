const fs = require('fs');
const Patient = require('../models/Patient');
const User = require('../models/User');
const Prediction = require('../models/Prediction');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { getDatasetStats, getDatasetPath } = require('../utils/diabeticDataParser');

// @desc    Get dashboard summary statistics
// @route   GET /api/analytics/summary
// @access  Private (Doctor, Hospital Admin, Researcher, System Admin)
exports.getSummaryStats = asyncHandler(async (req, res, next) => {
  const totalPatients = await Patient.countDocuments({});
  const readmittedPatients = await Patient.countDocuments({ isReadmitted: true });
  const readmissionRate = totalPatients > 0 ? Math.round((readmittedPatients / totalPatients) * 100) : 0;

  // Average time in hospital
  const timeInHospitalStats = await Patient.aggregate([
    { $unwind: '$admissionHistory' },
    {
      $group: {
        _id: null,
        avgTime: { $avg: '$admissionHistory.timeInHospital' }
      }
    }
  ]);
  const avgTimeInHospital = timeInHospitalStats.length > 0 ? Math.round(timeInHospitalStats[0].avgTime * 10) / 10 : 0;

  const totalDoctors = await User.countDocuments({ role: 'doctor', isActive: true });
  const totalPredictions = await Prediction.countDocuments({});

  // Hospital occupancy estimation (admitted in last 5 days)
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
  const activeAdmissions = await Patient.countDocuments({
    'admissionHistory.admissionDate': { $gte: fiveDaysAgo }
  });

  res.status(200).json({
    success: true,
    data: {
      totalPatients,
      readmittedPatients,
      readmissionRate,
      avgTimeInHospital,
      totalDoctors,
      totalPredictions,
      estimatedOccupancy: activeAdmissions || 8 // default fallback for styling demo
    }
  });
});

// @desc    Get readmission analytics trends (demographics & diagnoses)
// @route   GET /api/analytics/trends
// @access  Private (Doctor, Hospital Admin, Researcher, System Admin)
exports.getAnalyticsTrends = asyncHandler(async (req, res, next) => {
  // 1. Readmissions by Age Group
  const ageGroupData = await Patient.aggregate([
    {
      $group: {
        _id: '$ageGroup',
        total: { $sum: 1 },
        readmitted: { $sum: { $cond: [{ $eq: ['$isReadmitted', true] }, 1, 0] } }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // 2. Readmissions by Primary Diagnosis
  const diagnosisData = await Patient.aggregate([
    { $unwind: '$admissionHistory' },
    {
      $group: {
        _id: '$admissionHistory.primaryDiagnosis',
        total: { $sum: 1 },
        readmitted: { $sum: { $cond: [{ $eq: ['$isReadmitted', true] }, 1, 0] } }
      }
    },
    { $limit: 8 }
  ]);

  // 3. Treatment Effectiveness (Medication Change vs Readmission)
  const treatmentEffectiveness = await Patient.aggregate([
    { $unwind: '$admissionHistory' },
    {
      $group: {
        _id: {
          changeInMeds: '$admissionHistory.changeInMeds',
          diabetesMed: '$admissionHistory.diabetesMed'
        },
        total: { $sum: 1 },
        readmitted: { $sum: { $cond: [{ $eq: ['$isReadmitted', true] }, 1, 0] } }
      }
    },
    {
      $project: {
        _id: 0,
        changeInMeds: '$_id.changeInMeds',
        diabetesMed: '$_id.diabetesMed',
        total: 1,
        readmitted: 1
      }
    }
  ]);

  // 4. Recovery Trend (Time in hospital vs Readmission status)
  const lengthOfStayTrend = await Patient.aggregate([
    { $unwind: '$admissionHistory' },
    {
      $group: {
        _id: '$admissionHistory.timeInHospital',
        readmittedCount: { $sum: { $cond: [{ $eq: ['$isReadmitted', true] }, 1, 0] } },
        nonReadmittedCount: { $sum: { $cond: [{ $eq: ['$isReadmitted', false] }, 1, 0] } }
      }
    },
    { $sort: { _id: 1 } },
    { $limit: 10 }
  ]);

  // 5. Glycemic Outcome Correlation (HbA1c vs Readmission)
  const hba1cOutcomeData = await Patient.aggregate([
    { $unwind: '$admissionHistory' },
    {
      $group: {
        _id: '$admissionHistory.a1cResult',
        total: { $sum: 1 },
        readmitted: { $sum: { $cond: [{ $eq: ['$isReadmitted', true] }, 1, 0] } }
      }
    },
    { $sort: { total: -1 } }
  ]);

  // 6. Population Demographic Distribution (Race & Gender)
  const demographicData = await Patient.aggregate([
    {
      $group: {
        _id: { race: '$race', gender: '$gender' },
        total: { $sum: 1 },
        readmitted: { $sum: { $cond: [{ $eq: ['$isReadmitted', true] }, 1, 0] } }
      }
    },
    {
      $project: {
        _id: 0,
        race: '$_id.race',
        gender: '$_id.gender',
        total: 1,
        readmitted: 1
      }
    },
    { $sort: { total: -1 } }
  ]);

  // 7. Secondary Comorbidity Clustering
  const comorbidityData = await Patient.aggregate([
    { $unwind: '$admissionHistory' },
    {
      $group: {
        _id: '$admissionHistory.secondaryDiagnosis',
        total: { $sum: 1 },
        readmitted: { $sum: { $cond: [{ $eq: ['$isReadmitted', true] }, 1, 0] } }
      }
    },
    { $sort: { total: -1 } },
    { $limit: 6 }
  ]);

  // 8. Polypharmacy Burden vs Readmission
  const polypharmacyData = await Patient.aggregate([
    { $unwind: '$admissionHistory' },
    {
      $project: {
        isReadmitted: 1,
        tier: {
          $cond: [
            { $lt: ['$admissionHistory.numMedications', 10] },
            '<10 Medications (Low Burden)',
            {
              $cond: [
                { $lte: ['$admissionHistory.numMedications', 20] },
                '10-20 Medications (Moderate)',
                '>20 Medications (Polypharmacy)'
              ]
            }
          ]
        }
      }
    },
    {
      $group: {
        _id: '$tier',
        total: { $sum: 1 },
        readmitted: { $sum: { $cond: [{ $eq: ['$isReadmitted', true] }, 1, 0] } }
      }
    },
    { $sort: { total: -1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      ageGroupData,
      diagnosisData,
      treatmentEffectiveness,
      lengthOfStayTrend,
      hba1cOutcomeData,
      demographicData,
      comorbidityData,
      polypharmacyData
    }
  });
});

// @desc    Get dataset overview & metadata for researchers
// @route   GET /api/analytics/dataset-info
// @access  Private (Doctor, Hospital Admin, Researcher, System Admin)
exports.getDatasetOverview = asyncHandler(async (req, res, next) => {
  const stats = await getDatasetStats();
  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Download the common diabetic dataset CSV
// @route   GET /api/analytics/download-dataset
// @access  Private (Doctor, Hospital Admin, Researcher, System Admin)
exports.downloadDataset = asyncHandler(async (req, res, next) => {
  const filePath = getDatasetPath();
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      error: 'Dataset file not found in common backend data repository'
    });
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="diabetic_data.csv"');
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});
