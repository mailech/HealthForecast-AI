import api from './api';

export const bedService = {
  getSummary: async () => {
    const response = await api.get('/beds/summary');
    return response.data;
  },

  getWards: async () => {
    const response = await api.get('/beds/wards');
    return response.data;
  },

  getBeds: async (params = {}) => {
    const response = await api.get('/beds/', { params });
    return response.data;
  },

  assignBed: async (bedId, patientId) => {
    const response = await api.post('/beds/assign', {
      bed_id: Number(bedId),
      patient_id: Number(patientId),
    });
    return response.data;
  },

  releaseBed: async (bedId) => {
    const response = await api.post('/beds/release', {
      bed_id: Number(bedId),
    });
    return response.data;
  },

  updateBedStatus: async (bedId, status) => {
    const response = await api.patch(`/beds/${bedId}/status`, { status });
    return response.data;
  },
};
