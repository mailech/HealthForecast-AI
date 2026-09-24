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
      '/api/v1/auth/login',
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
      '/api/v1/auth/register',
      payload
    );

    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/api/v1/auth/me');
    return response.data;
  },

  forgotPassword: async (email) => {
    throw new Error('Forgot password is not connected yet.');
  },

  verifyOtp: async (otp) => {
    throw new Error('OTP verification is not connected yet.');
  },

  resetPassword: async (password) => {
    throw new Error('Password reset is not connected yet.');
  },
};