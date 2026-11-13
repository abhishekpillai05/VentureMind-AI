import api from './api';

export const financialService = {
  // Live deterministic arithmetic for sliders/inputs
  async simulate(inputs) {
    const response = await api.post('/finance/simulate', inputs);
    return response.data;
  },

  // Save financial scenario model to database
  async saveScenario(startupId, modelName, inputs) {
    const response = await api.post(`/finance/${startupId}`, { modelName, inputs });
    return response.data;
  },

  // Get saved models for a startup
  async getModels(startupId) {
    const response = await api.get(`/finance/${startupId}`);
    return response.data;
  },

  // Delete saved model
  async deleteModel(startupId, modelId) {
    const response = await api.delete(`/finance/${startupId}/${modelId}`);
    return response.data;
  },
};

export default financialService;
