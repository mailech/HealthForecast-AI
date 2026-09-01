const Patient = require('../models/Patient');
const User = require('../models/User');
const Prediction = require('../models/Prediction');
const { asyncHandler } = require('../middleware/errorMiddleware');

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

  res.status(200).json({
    success: true,
    data: {
      ageGroupData,
      diagnosisData,
      treatmentEffectiveness,
      lengthOfStayTrend
    }
  });
});
