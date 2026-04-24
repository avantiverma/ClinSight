import axios from 'axios';

const isProd = import.meta.env.PROD;
const LIVE_URL = 'https://YOUR-SERVICE-NAME.onrender.com/api'; // ← Replace with your actual Render URL after deployment
const LOCAL_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: isProd ? LIVE_URL : LOCAL_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle 401 errors (optional but good practice)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Clear storage and redirect to login if token is invalid/expired
            // avoiding infinite loops if already on login
            if (window.location.pathname !== '/login') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('role');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Patient & Prediction APIs
export interface PatientData {
    name: string;
    age: number;
    gender: string;
    phone: string;
    admission_date: string;
}

export const createPatient = async (data: PatientData) => {
    return await api.post('/patients/', data);
};

export const predictICU = async (patientId: string, data: any) => {
    return await api.post(`/predict/icu/${patientId}`, data);
};

export const predictLOS = async (patientId: string, data: any) => {
    return await api.post(`/predict/los-pipeline/${patientId}`, data);
};

export const getPatientHistory = async (patientId: string) => {
    return await api.get(`/patients/${patientId}/history`);
};

export const getMyPatients = async () => {
    return await api.get('/patients/mine');
};

export const getPatient = async (patientId: string) => {
    return await api.get(`/patients/${patientId}`);
};

export const updatePatientNotes = async (patientId: string, clinical_notes: string) => {
    return await api.put(`/patients/${patientId}/notes`, { clinical_notes });
};

export default api;
