const calculateReadmissionRisk = (patient) => {
  let score = 10; // Base probability score
  const keyContributors = [];
  const recommendations = [];

  const admissions = patient.admissionHistory || [];
  const latestAdmission = admissions.length > 0 ? admissions[admissions.length - 1] : null;

  // 1. Prior Admissions (Visits)
  const visits = admissions.length;
  if (visits > 1) {
    const addedPoints = Math.min((visits - 1) * 15, 35);
    score += addedPoints;
    keyContributors.push({
      feature: 'Prior Admissions',
      impact: 'Positive',
      details: `Patient has had ${visits} previous admissions, which strongly correlates with chronic instability (+${addedPoints}% risk).`
    });
  }

  // 2. Length of Stay (Latest Admission)
  if (latestAdmission) {
    const days = latestAdmission.timeInHospital;
    if (days >= 10) {
      score += 20;
      keyContributors.push({
        feature: 'Length of Stay',
        impact: 'Positive',
        details: `Latest hospital stay was prolonged (${days} days), indicating high complexity and slower recovery (+20% risk).`
      });
    } else if (days >= 6) {
      score += 12;
      keyContributors.push({
        feature: 'Length of Stay',
        impact: 'Positive',
        details: `Latest hospital stay was ${days} days (+12% risk).`
      });
    } else if (days >= 3) {
      score += 5;
      keyContributors.push({
        feature: 'Length of Stay',
        impact: 'Positive',
        details: `Latest hospital stay was ${days} days (+5% risk).`
      });
    }
  }

  // 3. Number of Medications (Polypharmacy)
  if (latestAdmission) {
    const meds = latestAdmission.numMedications;
    if (meds > 25) {
      score += 15;
      keyContributors.push({
        feature: 'Polypharmacy',
        impact: 'Positive',
        details: `Patient is taking ${meds} medications, which heavily increases the likelihood of adverse events and dosing errors (+15% risk).`
      });
    } else if (meds > 15) {
      score += 8;
      keyContributors.push({
        feature: 'Polypharmacy',
        impact: 'Positive',
        details: `Patient is taking ${meds} medications (+8% risk).`
      });
    }
  }

  // 4. Number of Diagnoses (Comorbidities)
  if (latestAdmission) {
    const diagnoses = latestAdmission.numDiagnoses;
    if (diagnoses >= 6) {
      score += 15;
      keyContributors.push({
        feature: 'Comorbidities',
        impact: 'Positive',
        details: `High number of diagnoses logged (${diagnoses}), indicating complex multi-system illness (+15% risk).`
      });
    } else if (diagnoses >= 3) {
      score += 8;
      keyContributors.push({
        feature: 'Comorbidities',
        impact: 'Positive',
        details: `Moderate comorbidity with ${diagnoses} diagnoses (+8% risk).`
      });
    }
  }

  // 5. Uncontrolled HbA1c / Glucose with no Medication Adjustment
  if (latestAdmission) {
    const a1c = latestAdmission.a1cResult;
    const change = latestAdmission.changeInMeds;
    const hasMed = latestAdmission.diabetesMed;

    if ((a1c === '>8' || a1c === '>7') && !change) {
      score += 18;
      keyContributors.push({
        feature: 'Uncontrolled HbA1c',
        impact: 'Positive',
        details: `Elevated HbA1c level (${a1c}) with no subsequent changes in medication regimens (+18% risk).`
      });
      recommendations.push('Refer the patient to a Certified Diabetes Educator (CDE).');
      recommendations.push('Re-evaluate and adjust current diabetes medication dosages.');
    } else if (a1c === 'Norm' || (a1c !== 'None' && change)) {
      score -= 5;
      keyContributors.push({
        feature: 'Diabetes Control',
        impact: 'Negative',
        details: `Controlled HbA1c levels or active medication management helps mitigate readmission risks (-5% risk).`
      });
    }
  }

  // 6. Age Group
  const age = patient.ageGroup || '50-60';
  if (age === '80-90' || age === '90-100') {
    score += 20;
    keyContributors.push({
      feature: 'Advanced Age',
      impact: 'Positive',
      details: `Geriatric age range (${age}) poses higher general frailty and dependency risks (+20% risk).`
    });
  } else if (age === '60-70' || age === '70-80') {
    score += 12;
    keyContributors.push({
      feature: 'Advanced Age',
      impact: 'Positive',
      details: `Patient age is in the ${age} category (+12% risk).`
    });
  } else if (age === '40-50' || age === '50-60') {
    score += 5;
  }

  // 7. Discharge Disposition
  if (latestAdmission) {
    const disp = latestAdmission.dischargeDisposition;
    if (disp && (disp.toLowerCase().includes('rehab') || disp.toLowerCase().includes('nursing') || disp.toLowerCase().includes('care'))) {
      score += 10;
      keyContributors.push({
        feature: 'Discharge Destination',
        impact: 'Positive',
        details: `Discharging to a care facility (${disp}) indicates need for transitional care support (+10% risk).`
      });
    }
  }

  // Cap risk score between 5% and 95%
  const finalProb = Math.max(5, Math.min(score, 95));
  let riskCategory = 'Low';
  if (finalProb > 65) {
    riskCategory = 'High';
  } else if (finalProb >= 35) {
    riskCategory = 'Medium';
  }

  // General Care Recommendations
  if (riskCategory === 'High') {
    recommendations.push('Schedule a clinical check-in or home-health phone call within 48 hours of discharge.');
    recommendations.push('Conduct a comprehensive pharmacist-led medication reconciliation.');
    recommendations.push('Schedule an in-person primary care physician follow-up within 7 days.');
    recommendations.push('Provide intensive warning signs/red-flags training to patient and primary caregiver.');
  } else if (riskCategory === 'Medium') {
    recommendations.push('Schedule a primary care physician follow-up within 10-14 days.');
    recommendations.push('Review the discharge prescription list with the patient and verify cost access.');
    recommendations.push('Provide disease-specific self-management educational materials.');
  } else {
    recommendations.push('Ensure standard follow-up appointment is scheduled within 30 days.');
    recommendations.push('Provide standard healthy living and medication instruction packets.');
  }

  // Discharge Support Recommendations
  let dischargeSupport = 'Standard discharge home.';
  if (riskCategory === 'High') {
    dischargeSupport = 'Transitional care management (TCM) enrollment. Home health care referral recommended.';
  } else if (riskCategory === 'Medium') {
    dischargeSupport = 'Standard discharge home with scheduled follow-up phone call in 1 week.';
  }

  return {
    riskScore: Math.round(finalProb),
    readmissionProbability: Math.round(finalProb),
    riskCategory,
    keyContributors,
    recommendations,
    dischargeSupport
  };
};

module.exports = {
  calculateReadmissionRisk
};
