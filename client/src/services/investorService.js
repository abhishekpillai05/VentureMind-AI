import api from './api';

export const investorService = {
  // Get all 4 investor personas
  async getPersonas() {
    const response = await api.get('/investors/personas');
    return response.data;
  },

  // Start new investor session
  async startSession(startupId, personaId) {
    const response = await api.post(`/investors/${startupId}/start`, { personaId });
    return response.data;
  },

  // Send message in chat session
  async sendMessage(startupId, sessionId, message) {
    const response = await api.post(`/investors/${startupId}/sessions/${sessionId}/message`, { message });
    return response.data;
  },

  // Complete and evaluate session
  async evaluateSession(startupId, sessionId) {
    const response = await api.post(`/investors/${startupId}/sessions/${sessionId}/evaluate`);
    return response.data;
  },

  // Get sessions list for a startup
  async getSessions(startupId) {
    const response = await api.get(`/investors/${startupId}/sessions`);
    return response.data;
  },

  // Get session details and full transcript
  async getSessionDetails(startupId, sessionId) {
    const response = await api.get(`/investors/${startupId}/sessions/${sessionId}`);
    return response.data;
  },
};

export default investorService;
