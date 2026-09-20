import api from './api';

export const reportService = {
  uploadAndExtract: async (patientId, file, onProgress) => {
    const formData = new FormData();
    formData.append('patient_id', patientId);
    formData.append('file', file);

    const response = await api.post('/reports/upload-extract', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    return response.data;
  },

  getMedicalReports: async (patientId) => {
    const response = await api.get(`/reports/medical-reports/${patientId}`);
    return response.data;
  },

  getReportSummary: async (patientId) => {
    const response = await api.get(`/reports/${patientId}`);
    return response.data;
  },
};
