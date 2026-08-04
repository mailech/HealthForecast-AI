import React, { createContext, useContext, useState, useEffect } from 'react';
import { healthApi } from '../services/api';

const PatientContext = createContext();

export const PatientProvider = ({ children }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [filters, setFilters] = useState({
    department: 'All Departments',
    risk_level: 'All Risk Levels',
    search: '',
  });

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await healthApi.getPatients(filters);
      setPatients(data);
    } catch (e) {
      console.error("Failed to fetch patients:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [filters]);

  const addPatient = async (newPatientData) => {
    // Generate new entry locally
    const id = patients.length + 1;
    const newEntry = {
      id,
      patient_code: `HF-${Math.floor(1000 + Math.random() * 9000)}`,
      ...newPatientData,
      readmission_risk_score: newPatientData.readmission_risk_score || 35.0,
      risk_level: newPatientData.risk_level || 'Medium'
    };
    setPatients([newEntry, ...patients]);
    return newEntry;
  };

  return (
    <PatientContext.Provider value={{
      patients,
      loading,
      filters,
      setFilters,
      selectedPatient,
      setSelectedPatient,
      fetchPatients,
      addPatient
    }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatients = () => useContext(PatientContext);
