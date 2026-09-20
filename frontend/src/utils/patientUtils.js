/**
 * Utility functions for Patient display and identification
 */

export const getPatientFullName = (patient) => {
  if (!patient) return '';
  
  const firstName = (patient.first_name || patient.firstName || '').trim();
  const lastName = (patient.last_name || patient.lastName || '').trim();

  // If first_name and last_name are identical, ignore duplicate last_name
  if (firstName && lastName && firstName.toLowerCase() === lastName.toLowerCase()) {
    return firstName;
  }

  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }

  if (firstName) return firstName;
  if (lastName) return lastName;

  return patient.name || patient.full_name || 'Unnamed Patient';
};

export const getPatientMRN = (patient) => {
  if (!patient) return 'PAT-0000';
  if (patient.mrn) return patient.mrn;
  const idStr = String(patient.id || 0).padStart(4, '0');
  return `PAT-${idStr}`;
};

export const getPatientLabel = (patient) => {
  if (!patient) return '';
  const mrn = getPatientMRN(patient);
  const name = getPatientFullName(patient);
  return `${mrn} — ${name}`;
};
