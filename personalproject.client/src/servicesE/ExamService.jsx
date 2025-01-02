import axios from './AxiosConf';

const ExamService = {
   
    fetchExam: async (certId) => {
        try {
            const response = await axios.get(`https://localhost:7295/api/Exam/${certId}`);
            const { CertName, Cost, Reward, Questions, Category, Achievements } = response.data;
    
            return {
                certName: CertName,
                cost: Cost,
                reward: Reward,
                category: Category.Id,
                achievements: Achievements.map((a) => ({ id: a.AchievementId })), 
                questions: Questions.map((q) => ({
                    id: q.Id,
                    text: q.Text,
                    correctAnswer: q.CorrectAnswer,
                    answerOptions: q.AnswerOptions.map((a) => ({
                        id: a.Id,
                        text: a.Text,
                        isCorrect: a.IsCorrect,
                    })),
                })),
            };
        } catch (error) {
            console.error('Error fetching exam:', error);
            throw 'Failed to fetch exam.';
        }
    },


    submitExam: async (certId, certName, category, cost, reward, achievements, questions) => {
        const url = certId
            ? `https://localhost:7295/api/Exam/update/${certId}`
            : 'https://localhost:7295/api/Exam/create';
        const method = certId ? 'put' : 'post';
    
        const payload = {
            certName,
            categoryId: category, // Fixed category reference
            cost,
            reward,
            achievementIds: achievements.map((a) => a.id), // Ensure achievements are mapped to IDs
            questions: questions.map((q) => ({
                id: q.id || 0,
                text: q.text,
                correctAnswer: q.correctAnswer,
                answerOptions: q.answerOptions.map((a) => ({
                    id: a.id || 0,
                    text: a.text,
                    isCorrect: a.isCorrect,
                })),
            })),
        };
    
        try {
            const response = await axios[method](url, payload);
            return response.data;
        } catch (error) {
            console.error('Error submitting exam:', error);
            throw 'Failed to submit the exam.';
        }
    },

    assignMarker: async (submissionId, markerId) => {
        const payload = { examSubmissionId: submissionId, markerId };

        try {
            const response = await axios.post(
                'https://localhost:7295/api/Exam/assign-marker',
                payload
            );
            return response.data;
        } catch (error) {
            console.error('Error assigning marker:', error);
            throw 'Failed to assign marker.';
        }
    },

    // Submit exam answers
    submitExamAnswers: async (userId, certId, answerIds) => {
        const payload = {
            userId,
            certId: parseInt(certId),
            answerIds: answerIds.map((id) => parseInt(id)),
        };

        try {
            const response = await axios.post('https://localhost:7295/api/Exam/submit', payload);
            return response.data;
        } catch (error) {
            console.error('Error submitting exam answers:', error);
            if (error.response?.status === 409) {
                throw 'Duplicate submission detected.';
            } else {
                throw 'Failed to submit exam answers.';
            }
        }
    },

    // Grade exam submission
    submitGrades: async (examSubmissionId, gradingData) => {
        const payload = { examSubmissionId, gradingData };

        try {
            const response = await axios.post(
                'https://localhost:7295/api/Exam/grade-submission',
                payload
            );
            return response.data;
        } catch (error) {
            console.error('Error submitting grades:', error);
            throw 'Failed to submit grades.';
        }
    },

    // Fetch marker assignments
    fetchMarkerAssignments: async (markerId) => {
        try {
            const response = await axios.get(
                `https://localhost:7295/api/Exam/marker-assignments/${markerId}`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching marker assignments:', error);
            throw 'Failed to fetch marker assignments.';
        }
    },

    // Fetch certificates for a user
    fetchUserCertificates: async (userId) => {
        try {
            const response = await axios.get(
                `https://localhost:7295/api/Exam/user-certificates/${userId}`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching certificates:', error);
            throw 'Failed to fetch certificates.';
        }
    },
    getOwnedCerts: async (userId) => {
        const response = await axios.get(`https://localhost:7295/api/Certs/${userId}/owned`);
        return response.data;
    }
};

export default ExamService;