import api from './api';

export const userService = {
  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  async getPreferences() {
    const response = await api.get('/users/preferences');
    return response.data;
  },

  async updatePreferences(preferencesData) {
    const response = await api.put('/users/preferences', preferencesData);
    return response.data;
  },

  async changePassword({ current_password, new_password, confirm_password }) {
    const response = await api.put('/users/password', {
      current_password,
      new_password,
      confirm_password,
    });
    return response.data;
  },

  async deleteAccount({ password, confirmation_text }) {
    const response = await api.delete('/users/account', {
      data: { password, confirmation_text },
    });
    return response.data;
  },
};

export default userService;
