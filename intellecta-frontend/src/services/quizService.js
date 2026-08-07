import api from './api';

const quizService = {
    getAllQuizzes: async () => {
        const response = await api.get('/quizzes');
        return response.data;
    },

    getQuizById: async (id) => {
        const response = await api.get(`/quizzes/${id}`);
        return response.data;
    },

    createQuiz: async (quizData) => {
        const response = await api.post('/quizzes', quizData);
        return response.data;
    },

    submitQuiz: async (submissionData) => {
        const response = await api.post('/quizzes/submit', submissionData);
        return response.data;
    },

    getUserAttempts: async (userId) => {
        const response = await api.get(`/quizzes/attempts/user/${userId}`);
        return response.data;
    },

    getSubmissionResult: async (attemptId) => {
        const response = await api.get(`/quizzes/submissions/${attemptId}`);
        return response.data;
    },

    getPendingSubmissions: async () => {
        const response = await api.get('/admin/quiz-submissions');
        return response.data;
    },

    getSubmissionDetail: async (attemptId) => {
        const response = await api.get(`/admin/quiz-submissions/${attemptId}`);
        return response.data;
    },

    gradeSubmission: async (attemptId, questionMarks) => {
        const response = await api.post(`/admin/quiz-submissions/${attemptId}/grade`, { attemptId, questionMarks });
        return response.data;
    }
};

export default quizService;
