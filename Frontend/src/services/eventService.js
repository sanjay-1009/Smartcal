import api from './api';

export const eventService = {
  async getAllEvents(params = {}) {
    const res = await api.get('/events', { params });
    return res.data?.data || [];
  },

  async getUpcomingEvents() {
    const res = await api.get('/events', { params: { upcoming: true } });
    return res.data?.data || [];
  },

  async searchEvents(query) {
    const res = await api.get('/events', { params: { search: query } });
    return res.data?.data || [];
  },

  async getEventsByRange(startDate, endDate) {
    const res = await api.get('/events', { params: { startDate, endDate } });
    return res.data?.data || [];
  },

  async getEventById(id) {
    const res = await api.get(`/events/${id}`);
    return res.data?.data;
  },

  async createEvent(eventData) {
    const res = await api.post('/events', eventData);
    return res.data?.data;
  },

  async updateEvent(id, eventData) {
    const res = await api.put(`/events/${id}`, eventData);
    return res.data?.data;
  },

  async deleteEvent(id) {
    const res = await api.delete(`/events/${id}`);
    return res.data;
  },

  async checkConflicts(conflictData) {
    const res = await api.post('/events/conflicts/check', conflictData);
    return res.data?.data;
  }
};
