import api from './api';

export const authService = {
  async register({ full_name, email, password, confirm_password, terms }) {
    const response = await api.post('/auth/register', {
      full_name,
      email,
      password,
      confirm_password,
      terms,
    });
    return response.data;
  },

  async login({ email, password }) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async verifyEmail({ email, otp }) {
    const response = await api.post('/auth/verify-email', { email, otp });
    return response.data;
  },

  async resendOtp({ email }) {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  },

  async forgotPassword({ email }) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword({ email, otp, new_password, confirm_password }) {
    const response = await api.post('/auth/reset-password', {
      email,
      otp,
      new_password,
      confirm_password,
    });
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
