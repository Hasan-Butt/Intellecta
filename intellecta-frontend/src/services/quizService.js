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
    }
};

export default quizService;
