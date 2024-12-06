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
    return response.data; // Ensure the fetched data is returned
};

export default {
    getCerts,
    getCertById,
    createCert,
    updateCert,
    deleteCert,
    fetchCertificates,
};