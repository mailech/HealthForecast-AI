import api from './api';

export const authService = {
  login: async (email, password, role) => {
    const formData = new URLSearchParams();

    formData.append('username', (email || '').trim().toLowerCase());
    formData.append('password', password || '');

    if (role) {
      formData.append('role', role);
    }

    const response = await api.post(
      '/auth/login',
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data;
  },

  register: async (data) => {
    const payload = {
      ...data,
      email: (data.email || '').trim().toLowerCase(),
      full_name: (data.full_name || '').trim(),
      phone: data.phone ? data.phone.trim() : null,
    };

    const response = await api.post(
      '/auth/register',
      payload
    );

    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  verifyOtp: async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  resetPassword: async (resetToken, password) => {
    const response = await api.post('/auth/reset-password', { reset_token: resetToken, new_password: password });
    return response.data;
  },
};