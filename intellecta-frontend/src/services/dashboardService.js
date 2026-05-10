import api from "./api";

const getUserId = () => localStorage.getItem('userId') || '2';

export const getDashboard = (userId = getUserId()) =>
  api.get(`/dashboard/user/${userId}`);

export const logDistraction = (reason, userId = getUserId()) =>
  api.post(`/distractions/user/${userId}`, { reason });

export const startSession = (subject, deepWork = false, userId = getUserId()) =>
  api.post(`/sessions/user/${userId}/start`, { subject, deepWork });

export const endSession = (sessionId, pomodorosCompleted) =>
  api.patch(`/sessions/${sessionId}/end`, { pomodorosCompleted });