import api from './api';

export const userService = {
  async getProfile() {
    const res = await api.get('/user/profile');
    return res.data?.data;
  }
};
