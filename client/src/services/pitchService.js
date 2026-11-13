import api from './api';

export const pitchService = {
  // Submit pitch transcript for AI evaluation
  async evaluatePitch(startupId, pitchTranscript, durationMinutes) {
    const response = await api.post(`/pitch/${startupId}`, {
      pitchTranscript,
      durationMinutes,
    });
    return response.data;
  },

  // Get latest pitch evaluation
  async getLatestPitch(startupId) {
    const response = await api.get(`/pitch/${startupId}`);
    return response.data;
  },

  // Get pitch evaluation history
  async getPitchHistory(startupId) {
    const response = await api.get(`/pitch/${startupId}/history`);
    return response.data;
  },
};

export default pitchService;
