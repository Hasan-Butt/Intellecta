import api from './api';

const USER_ID = localStorage.getItem('userId') || '2';

const badgeService = {
  // Admin: Get all badge definitions with analytics
  getAllBadgeDefs: async () => {
    const response = await api.get('/admin/badges');
    return response.data;
  },

  // Admin: Create custom badge
  createBadgeDef: async (data) => {
    const response = await api.post('/admin/badges', data);
    return response.data;
  },

  // Admin: Update badge
  updateBadgeDef: async (badgeKey, data) => {
    const response = await api.put(`/admin/badges/${badgeKey}`, data);
    return response.data;
  },

  // Admin: Upload image
  uploadBadgeImage: async (badgeKey, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/admin/badges/${badgeKey}/image`, formData);
  return response.data;
},

  // Admin: Delete badge
  deleteBadgeDef: async (badgeKey) => {
    const response = await api.delete(`/admin/badges/${badgeKey}`);
    return response.data;
  },

  // Student: Get all badges with earned status
  getMyAchievements: async () => {
    const response = await api.get(`/achievements/user/${USER_ID}/all`);
    return response.data;
  },

  // Get image URL
  getBadgeImageUrl: (badgeKey) => {
    return `${api.defaults.baseURL}/badges/${badgeKey}/image`;
  }
};

export default badgeService;
