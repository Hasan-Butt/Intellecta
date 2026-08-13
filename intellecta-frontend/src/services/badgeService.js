import api from './api';

import { getUserId } from "../utils/auth";

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

  // Admin: Upload image — sends CDN URL to backend (file already uploaded to UploadThing)
  uploadBadgeImage: async (badgeKey, imageUrl) => {
    const response = await api.post(`/admin/badges/${badgeKey}/image`, { imageUrl });
    return response.data;
  },

  // Admin: Delete badge
  deleteBadgeDef: async (badgeKey) => {
    const response = await api.delete(`/admin/badges/${badgeKey}`);
    return response.data;
  },

  // Student: Get all badges with earned status
  getMyAchievements: async () => {
    const response = await api.get(`/achievements/user/${getUserId()}/all`);
    return response.data;
  },

  // Get image URL
  getBadgeImageUrl: (badgeKey) => {
    return `${api.defaults.baseURL}/badges/${badgeKey}/image`;
  }
};

export default badgeService;
