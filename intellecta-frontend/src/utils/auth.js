import api from "../services/api";

let currentUserId = null;
let currentRole = null;

export function setAuthData(userId, role) {
  currentUserId = userId;
  currentRole = role;
}

export function getUserId() {
  return currentUserId;
}

export function getRole() {
  return currentRole;
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } catch (e) {
    console.error("Logout request failed:", e);
  } finally {
    currentUserId = null;
    currentRole = null;
    localStorage.clear();
    window.location.href = "/login";
  }
}
