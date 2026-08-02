import api from './api';

export const userService = {
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  activateUser: async (id) => {
    const response = await api.put(`/users/${id}`, { is_active: true });
    return response.data;
  },

  deactivateUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};
