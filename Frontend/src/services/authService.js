import api from './api';

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async verifyOtp(data) {
    const res = await api.post('/auth/verify-otp', data);
    if (res.data?.data?.token) {
      localStorage.setItem('smartcal_token', res.data.data.token);
      localStorage.setItem('smartcal_user', JSON.stringify(res.data.data));
    }
    return res.data;
  },

  async resendOtp(usernameOrPhone) {
    const res = await api.post('/auth/resend-otp', { usernameOrPhone });
    return res.data;
  },

  async login(data) {
    const res = await api.post('/auth/login', data);
    if (res.data?.data?.token) {
      localStorage.setItem('smartcal_token', res.data.data.token);
      localStorage.setItem('smartcal_user', JSON.stringify(res.data.data));
    }
    return res.data;
  },

  logout() {
    localStorage.removeItem('smartcal_token');
    localStorage.removeItem('smartcal_user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('smartcal_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken() {
    return localStorage.getItem('smartcal_token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('smartcal_token');
  }
};
