import api from "./api";

import { getUserId } from "../utils/auth";

// Guard: throws early if the user is not yet authenticated in localStorage.
// Prevents broken /user/null requests during React 18 Strict Mode double-invoke
// or before ProtectedRoute finishes its /auth/me check.
const uid = () => {
  const id = getUserId();
  if (!id) throw new Error("User not authenticated");
  return id;
};

// Subjects
export const getSubjects = () =>
  api.get(`/subjects/user/${uid()}`);

export const createSubject = (subjectData) =>
  api.post(`/subjects/user/${uid()}`, subjectData);

export const deleteSubject = (subjectId) =>
  api.delete(`/subjects/user/${uid()}/${subjectId}`);

// Documents
export const getDocumentsBySubject = (subject) =>
  api.get(`/documents/user/${uid()}/subject`, { params: { subject } });

export const uploadDocument = (file, subject, semester) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("subject", subject);
  formData.append("semester", semester || "Semester 1");
  return api.post(`/documents/upload/user/${uid()}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const searchDocuments = (q, subject) =>
  api.get(`/documents/user/${uid()}/search`, { params: { q, subject } });

export const updateDocumentTags = (documentId, tags) =>
  api.put(`/documents/user/${uid()}/${documentId}/tags`, { tags });

export const deleteDocument = (documentId) =>
  api.delete(`/documents/user/${uid()}/${documentId}`);