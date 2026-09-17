import api from './api';

export const extractService = {
  async extractFromText(text) {
    const res = await api.post('/extract/text', { text });
    return res.data?.data;
  },

  async extractFromUrl(url) {
    const res = await api.post('/extract/url', { url });
    return res.data?.data;
  },

  async extractFromPdf(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/extract/pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data?.data;
  },

  async extractFromImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/extract/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data?.data;
  }
};
