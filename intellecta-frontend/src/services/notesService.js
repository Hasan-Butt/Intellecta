import api from "./api";

const getUserId = () => localStorage.getItem('userId');

export const getAllNotes = () => api.get(`/notes/user/${getUserId()}`);

export const createNote = (noteData) =>
  api.post(`/notes/user/${getUserId()}`, noteData);

export const updateNote = (noteId, noteData) =>
  api.put(`/notes/user/${getUserId()}/${noteId}`, noteData);

export const deleteNote = (noteId) =>
  api.delete(`/notes/user/${getUserId()}/${noteId}`);

export const searchNotes = (q = "", tag = "") =>
  api.get(`/notes/user/${getUserId()}/search`, { params: { q, tag } });

export const togglePin = (noteId) =>
  api.patch(`/notes/user/${getUserId()}/${noteId}/pin`);

export const flagForReview = (noteId) =>
  api.patch(`/notes/user/${getUserId()}/${noteId}/review`);

export const getReviewQueue = () =>
  api.get(`/notes/user/${getUserId()}/review-queue`);
