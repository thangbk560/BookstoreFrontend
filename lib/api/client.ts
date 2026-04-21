import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        // Only access localStorage in browser environment
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem("access_token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retrying, try to refresh token
        // Skip for login endpoint to allow handling invalid credentials
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
            originalRequest._retry = true;

            // Only handle refresh in browser environment
            if (typeof window !== 'undefined') {
                try {
                    const refreshToken = localStorage.getItem("refresh_token");
                    if (!refreshToken) {
                        throw new Error('No refresh token available');
                    }

                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken,
                    });

                    const { access_token } = response.data;
                    localStorage.setItem("access_token", access_token);

                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    // Clear tokens and redirect to login
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    localStorage.removeItem("user");
                    window.location.href = "/auth/login";
                    return Promise.reject(refreshError);
                }
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
