export function patientLabel(patient, { anonymous = false } = {}) {
  if (!patient) return 'Unknown patient';
  if (anonymous) {
    return patient.patient_id || `ANON-${String(patient.id).padStart(6, '0')}`;
  }
  const name = patient.full_name || patient.patient_name;
  const id = patient.patient_code || patient.patient_id;
  if (name && id) return `${name} (${id})`;
  return name || (id ? `#${id}` : 'Unknown patient');
}
