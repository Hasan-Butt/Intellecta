import api from "./api";

import { getUserId } from "../utils/auth";

// Subjects
export const getSubjects = () =>
  api.get(`/subjects/user/${getUserId()}`);

export const createSubject = (subjectData) =>
  api.post(`/subjects/user/${getUserId()}`, subjectData);

export const deleteSubject = (subjectId) =>
  api.delete(`/subjects/user/${getUserId()}/${subjectId}`);

// Documents
export const getDocumentsBySubject = (subject) =>
  api.get(`/documents/user/${getUserId()}/subject`, { params: { subject } });

export const uploadDocument = (file, subject, semester) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("subject", subject);
  formData.append("semester", semester || "Semester 1");
  return api.post(`/documents/upload/user/${getUserId()}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const searchDocuments = (q, subject) =>
  api.get(`/documents/user/${getUserId()}/search`, { params: { q, subject } });

export const updateDocumentTags = (documentId, tags) =>
  api.put(`/documents/user/${getUserId()}/${documentId}/tags`, { tags });

export const deleteDocument = (documentId) =>
  api.delete(`/documents/user/${getUserId()}/${documentId}`);