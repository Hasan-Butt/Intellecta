import api from "./api";

const USER_ID = 1; // temporary — replace with JWT user later

export const getAllNotes = () => api.get(`/notes/user/${USER_ID}`);

export const createNote = (noteData) =>
  api.post(`/notes/user/${USER_ID}`, noteData);

export const updateNote = (noteId, noteData) =>
  api.put(`/notes/user/${USER_ID}/${noteId}`, noteData);

export const deleteNote = (noteId) =>
  api.delete(`/notes/user/${USER_ID}/${noteId}`);

export const searchNotes = (q = "", tag = "") =>
  api.get(`/notes/user/${USER_ID}/search`, { params: { q, tag } });

export const togglePin = (noteId) =>
  api.patch(`/notes/user/${USER_ID}/${noteId}/pin`);

export const flagForReview = (noteId) =>
  api.patch(`/notes/user/${USER_ID}/${noteId}/review`);

export const getReviewQueue = () =>
  api.get(`/notes/user/${USER_ID}/review-queue`);
