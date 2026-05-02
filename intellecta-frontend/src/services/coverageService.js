import api from "./api";

// Topics
export const getTopicsBySubject = (subjectId) =>
  api.get(`/topics/subject/${subjectId}`);

export const getTopicsByExam = (examId) =>
  api.get(`/topics/exam/${examId}`);

export const createTopic = (subjectId, data) =>
  api.post(`/topics/subject/${subjectId}`, data);

export const bulkUpdateTopicStatuses = (updates) =>
  api.put(`/topics/bulk-status`, { updates });

export const deleteTopic = (topicId) =>
  api.delete(`/topics/${topicId}`);

// Exams
export const getExamsBySubject = (subjectId) =>
  api.get(`/exams/subject/${subjectId}`);

export const createExam = (data) =>
  api.post(`/exams`, data);

export const updateExamDate = (examId, examDate) =>
  api.put(`/exams/${examId}/date`, { examDate });

export const deleteExam = (examId) =>
  api.delete(`/exams/${examId}`);

// Checklist
export const getChecklistByExam = (examId) =>
  api.get(`/checklist/exam/${examId}`);

export const createChecklistItem = (examId, description) =>
  api.post(`/checklist/exam/${examId}`, { description });

export const toggleChecklistItem = (itemId) =>
  api.patch(`/checklist/${itemId}/toggle`);

export const deleteChecklistItem = (itemId) =>
  api.delete(`/checklist/${itemId}`);