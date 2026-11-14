import apiClient from "./client";

export interface LoginCredentials {
    email: string;
    password: string;
    captcha?: string;
    captchaId?: string;
}

export interface SignupData {
    email: string;
    password: string;
    name: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
}

export interface SignupResponse {
    message?: string;
    requireOtp?: boolean;
    access_token?: string;
    refresh_token?: string;
    user?: any;
}

export interface LoginResponse extends AuthResponse {
    requireCaptcha?: boolean;
    message?: string;
}

export const authApi = {
    login: async (credentials: LoginCredentials): Promise<LoginResponse | any> => {
        const response = await apiClient.post("/auth/login", credentials);
        if (response.data.access_token) {
            localStorage.setItem("access_token", response.data.access_token);
            localStorage.setItem("refresh_token", response.data.refresh_token);
        }
        return response.data;
    },

    signup: async (data: SignupData): Promise<SignupResponse> => {
        const response = await apiClient.post("/auth/signup", data);
        if (response.data.access_token) {
            localStorage.setItem("access_token", response.data.access_token);
            localStorage.setItem("refresh_token", response.data.refresh_token);
        }
        return response.data;
    },

    verifyRegistration: async (email: string, otp: string): Promise<AuthResponse> => {
        const response = await apiClient.post("/auth/verify-registration", { email, otp });
        if (response.data.access_token) {
            localStorage.setItem("access_token", response.data.access_token);
            localStorage.setItem("refresh_token", response.data.refresh_token);
        }
        return response.data;
    },

    getCaptcha: async (): Promise<{ image: string; id: string }> => {
        const response = await apiClient.get("/auth/captcha");
        return response.data;
    },

    logout: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
    },

    getCurrentUser: async () => {
        const response = await apiClient.get("/auth/me");
        return response.data;
    },
};
