import api from './api';

export const marketService = {
  // Trigger AI Market Research analysis
  async analyzeMarketResearch(startupId) {
    const response = await api.post(`/market/${startupId}`);
    return response.data;
  },

  // Get latest market research report
  async getLatestMarketResearch(startupId) {
    const response = await api.get(`/market/${startupId}`);
    return response.data;
  },

  // Get market research history
  async getMarketHistory(startupId) {
    const response = await api.get(`/market/${startupId}/history`);
    return response.data;
  },
};

export default marketService;
