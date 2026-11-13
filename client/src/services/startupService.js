import api from './api';

export const startupService = {
  // Fetch all startups owned by current user
  async getAllStartups() {
    const response = await api.get('/startups');
    return response.data;
  },

  // Fetch single startup with readiness and validation summary
  async getStartupById(id) {
    const response = await api.get(`/startups/${id}`);
    return response.data;
  },

  // Create new startup
  async createStartup(startupData) {
    const response = await api.post('/startups', startupData);
    return response.data;
  },

  // Update existing startup
  async updateStartup(id, startupData) {
    const response = await api.put(`/startups/${id}`, startupData);
    return response.data;
  },

  // Delete startup
  async deleteStartup(id) {
    const response = await api.delete(`/startups/${id}`);
    return response.data;
  },
};

export default startupService;
