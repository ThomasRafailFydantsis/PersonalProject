import axios from 'axios';

const getCerts = async () => {
    const response = await axios.get("https://localhost:7295/api/Certs");
    return response.data;
};

const getCertById = async (id) => {
    const response = await axios.get(`https://localhost:7295/api/Certs/${id}`);
    return response.data;
};

const createCert = async (cert) => {
    const response = await axios.post("https://localhost:7295/api/Certs", cert);
    return response.data;
};

const updateCert = async (id, updatedCert) => {
    await axios.put(`https://localhost:7295/api/Certs/${id}`, updatedCert);
};

const deleteCert = async (id) => {
    await axios.delete(`https://localhost:7295/api/Certs/${id}`);
};

export default {
    getCerts,
    getCertById,
    createCert,
    updateCert,
    deleteCert,
};