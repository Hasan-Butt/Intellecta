import api from '../services/api';
import { getUserId } from './auth';

let cachedProfile = null;
let cachedDashboard = null;
let isFetchingProfile = false;
let isFetchingDashboard = false;

export async function getUserProfile(forceRefresh = false) {
  const userId = getUserId();
  if (!userId) return null;
  if (cachedProfile && !forceRefresh) return cachedProfile;
  if (isFetchingProfile) return cachedProfile;

  isFetchingProfile = true;
  try {
    const res = await api.get(`/users/${userId}/profile`);
    cachedProfile = res.data;
    try {
      localStorage.setItem(`intellecta_profile_${userId}`, JSON.stringify(res.data));
    } catch (e) {}
    return cachedProfile;
  } catch (err) {
    return cachedProfile;
  } finally {
    isFetchingProfile = false;
  }
}

export function setUserProfile(data) {
  if (!data) return;
  cachedProfile = { ...(cachedProfile || {}), ...data };
  const userId = getUserId();
  if (userId) {
    try {
      localStorage.setItem(`intellecta_profile_${userId}`, JSON.stringify(cachedProfile));
    } catch (e) {}
  }
}

export function getInitialProfile() {
  if (cachedProfile) return cachedProfile;
  const userId = getUserId();
  if (userId) {
    try {
      const saved = localStorage.getItem(`intellecta_profile_${userId}`);
      if (saved) {
        cachedProfile = JSON.parse(saved);
        return cachedProfile;
      }
    } catch (e) {}
  }
  return null;
}

export async function getUserDashboard(forceRefresh = false) {
  const userId = getUserId();
  if (!userId) return null;
  if (cachedDashboard && !forceRefresh) return cachedDashboard;
  if (isFetchingDashboard) return cachedDashboard;

  isFetchingDashboard = true;
  try {
    const res = await api.get(`/dashboard/user/${userId}`);
    cachedDashboard = res.data;
    try {
      localStorage.setItem(`intellecta_dashboard_${userId}`, JSON.stringify(res.data));
    } catch (e) {}
    return cachedDashboard;
  } catch (err) {
    return cachedDashboard;
  } finally {
    isFetchingDashboard = false;
  }
}

export function getInitialDashboard() {
  if (cachedDashboard) return cachedDashboard;
  const userId = getUserId();
  if (userId) {
    try {
      const saved = localStorage.getItem(`intellecta_dashboard_${userId}`);
      if (saved) {
        cachedDashboard = JSON.parse(saved);
        return cachedDashboard;
      }
    } catch (e) {}
  }
  return null;
}

export function invalidateUserCache() {
  cachedProfile = null;
  cachedDashboard = null;
}
