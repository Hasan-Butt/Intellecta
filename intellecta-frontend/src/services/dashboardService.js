import api from "./api";

const USER_ID = 1; // replace with JWT-decoded userId later

export const getDashboard = () =>
  api.get(`/dashboard/user/${USER_ID}`);

export const logDistraction = (reason) =>
  api.post(`/distractions/user/${USER_ID}`, { reason });

export const startSession = (subject, deepWork = false) =>
  api.post(`/sessions/user/${USER_ID}/start`, { subject, deepWork });

export const endSession = (sessionId) =>
  api.patch(`/sessions/${sessionId}/end`);