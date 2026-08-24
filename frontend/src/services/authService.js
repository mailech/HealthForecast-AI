import api from './api';

export const authService = {
  login: async (email, password) => {
    const formData = new URLSearchParams();

    formData.append('username', email);
    formData.append('password', password);

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
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  forgotPassword: async (email) => {
    // Backend lo forgot-password endpoint currently available ani confirm cheyyaledu.
    throw new Error('Forgot password is not connected yet.');
  },

  verifyOtp: async (otp) => {
    throw new Error('OTP verification is not connected yet.');
  },

  resetPassword: async (password) => {
    throw new Error('Password reset is not connected yet.');
  },
};