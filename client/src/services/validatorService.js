import api from './api';

export const validatorService = {
  // Trigger AI Idea Validation for a startup
  async analyzeStartupIdea(startupId) {
    const response = await api.post(`/validator/${startupId}`);
    return response.data;
  },

  // Get latest validation report for a startup
  async getLatestValidation(startupId) {
    const response = await api.get(`/validator/${startupId}`);
    return response.data;
  },

  // Get all previous validation records for this startup
  async getValidationHistory(startupId) {
    const response = await api.get(`/validator/${startupId}/history`);
    return response.data;
  },

  // Get specific historical validation report by validation ID
  async getValidationById(startupId, validationId) {
    const response = await api.get(`/validator/${startupId}/${validationId}`);
    return response.data;
  },
};

export default validatorService;
