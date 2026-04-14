import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// Event emitter for cold start detection
export const apiEvents = {
    onColdStart: (isStarting: boolean) => {
        window.dispatchEvent(new CustomEvent('api:cold-start', { detail: isStarting }));
    }
};

let activeRequests = 0;
let coldStartTimer: any = null;

api.interceptors.request.use((config) => {
    activeRequests++;

    // If no request resolves within 2 seconds, assume a cold start
    if (!coldStartTimer) {
        coldStartTimer = setTimeout(() => {
            if (activeRequests > 0) {
                apiEvents.onColdStart(true);
            }
        }, 2000);
    }

    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const handleResponse = (response: any) => {
    activeRequests--;
    if (activeRequests === 0) {
        clearTimeout(coldStartTimer);
        coldStartTimer = null;
        apiEvents.onColdStart(false);
    }
    return response;
};

const handleError = (error: any) => {
    activeRequests--;
    if (activeRequests === 0) {
        clearTimeout(coldStartTimer);
        coldStartTimer = null;
        apiEvents.onColdStart(false);
    }
    return Promise.reject(error);
};

api.interceptors.response.use(handleResponse, handleError);

export default api;
