import axios from 'axios';

const BASE_URL = "https://localhost:7295/api/Certs";

const getCerts = async () => {
    const response = await axios.get(BASE_URL);
    return response.data;
};

const getCertById = async (id) => {
    const response = await axios.get(`${BASE_URL}/${id}`);
    return response.data;
};

const createCert = async (cert) => {
    const response = await axios.post(BASE_URL, cert);
    return response.data;
};

const updateCert = async (id, updatedCert) => {
    await axios.put(`${BASE_URL}/${id}`, updatedCert);
};

const deleteCert = async (id) => {
    await axios.delete(`${BASE_URL}/${id}`);
};

const fetchCertificates = async (userId) => {
    const response = await axios.get(`${BASE_URL}/${userId}/certificates`);
    return response.data; 
};
 const fetchExamById = async (certId) => {
    try {
        const response = await axios.get(`https://localhost:7295/api/Exam/${certId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching exam:', error);
        throw error;
    }
};

 const submitExam = async (userId, certId, answerIds) => {
    try {
        const response = await axios.post('https://localhost:7295/api/Exam/submit', {
            userId,
            certId,
            answerIds,
        });
        return response.data;
    } catch (error) {
        console.error('Error submitting exam:', error);
        throw error.response?.data || error.message;
    }
};

//const fetchScores = async (userId) => {
//  const response =  await axios.get(`${BASE_URL2}/${userId}`);
//    return response.data;
//};
export default {
    getCerts,
    getCertById,
    createCert,
    updateCert,
    deleteCert,
    fetchCertificates,
    fetchExamById,
    submitExam

    //fetchScores
};
