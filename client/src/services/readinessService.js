import api from './api';

export const readinessService = {
  // Get combined readiness score & breakdown
  async getReadiness(startupId) {
    const response = await api.get(`/readiness/${startupId}`);
    return response.data;
  },
};

export default readinessService;
