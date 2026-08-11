import api from "./api";

import { getUserId } from "../utils/auth";

const uid = () => {
  const id = getUserId();
  if (!id) throw new Error("User not authenticated");
  return id;
};

export const getAllNotes = () => api.get(`/notes/user/${uid()}`);

export const createNote = (noteData) =>
  api.post(`/notes/user/${uid()}`, noteData);

export const updateNote = (noteId, noteData) =>
  api.put(`/notes/user/${uid()}/${noteId}`, noteData);

export const deleteNote = (noteId) =>
  api.delete(`/notes/user/${uid()}/${noteId}`);

export const searchNotes = (q = "", tag = "") =>
  api.get(`/notes/user/${uid()}/search`, { params: { q, tag } });

export const togglePin = (noteId) =>
  api.patch(`/notes/user/${uid()}/${noteId}/pin`);

export const flagForReview = (noteId) =>
  api.patch(`/notes/user/${uid()}/${noteId}/review`);

export const getReviewQueue = () =>
  api.get(`/notes/user/${uid()}/review-queue`);
