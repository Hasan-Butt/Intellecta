import api from "../services/api";

const USER_ID_KEY = "intellecta_userId";
const ROLE_KEY = "intellecta_role";

export function setAuthData(userId, role) {
  if (userId) localStorage.setItem(USER_ID_KEY, userId);
  if (role) localStorage.setItem(ROLE_KEY, role);
}

export function getUserId() {
  return localStorage.getItem(USER_ID_KEY);
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY);
}

export function clearAuthData() {
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } catch (e) {
    console.error("Logout request failed:", e);
  } finally {
    clearAuthData();
    window.location.href = "/login";
  }
}
