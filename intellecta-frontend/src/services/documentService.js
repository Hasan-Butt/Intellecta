import api from "./api";

const USER_ID = 1; // temporary — replace with JWT later

// Subjects
export const getSubjects = () =>
  api.get(`/subjects/user/${USER_ID}`);

export const createSubject = (subjectData) =>
  api.post(`/subjects/user/${USER_ID}`, subjectData);

export const deleteSubject = (subjectId) =>
  api.delete(`/subjects/user/${USER_ID}/${subjectId}`);

// Documents
export const getDocumentsBySubject = (subject) =>
  api.get(`/documents/user/${USER_ID}/subject`, { params: { subject } });

export const uploadDocument = (file, subject, semester) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("subject", subject);
  formData.append("semester", semester || "Semester 1");
  return api.post(`/documents/upload/user/${USER_ID}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const searchDocuments = (q, subject) =>
  api.get(`/documents/user/${USER_ID}/search`, { params: { q, subject } });

export const updateDocumentTags = (documentId, tags) =>
  api.put(`/documents/user/${USER_ID}/${documentId}/tags`, { tags });

export const deleteDocument = (documentId) =>
  api.delete(`/documents/user/${USER_ID}/${documentId}`);