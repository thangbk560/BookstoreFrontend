"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api/auth";
import { useCart } from "@/lib/store/cartStore";

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    phone?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string, captcha?: string, captchaId?: string) => Promise<any>;
    signup: (email: string, password: string, name: string) => Promise<any>;
    verifyRegistration: (email: string, otp: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    setAuth: (authState: { user: User; isAuthenticated: boolean }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const checkAuth = async () => {
            // Don't check auth on the callback page - let the callback page handle it
            if (typeof window !== 'undefined' && window.location.pathname === '/auth/callback') {
                setLoading(false);
                return;
            }

            // Only run in browser environment
            if (typeof window === 'undefined') {
                setLoading(false);
                return;
            }

            const token = localStorage.getItem("access_token");
            const storedUser = localStorage.getItem("user");

            // First, restore user from localStorage for immediate UI update
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (error) {
                    console.error("Failed to parse stored user:", error);
                    localStorage.removeItem("user");
                }
            }

            // Then verify token is still valid (but don't logout if this fails)
            if (token) {
                try {
                    const userData = await authApi.getCurrentUser();
                    setUser(userData);
                    // Update stored user data
                    localStorage.setItem("user", JSON.stringify(userData));
                } catch (error: any) {
                    // If it's a 401, it means the token is invalid/expired and refresh failed
                    if (error.response?.status === 401) {
                        // Clear all auth data
                        localStorage.removeItem("access_token");
                        localStorage.removeItem("refresh_token");
                        localStorage.removeItem("user");
                        setUser(null);
                    } else {
                        console.error("Auth check failed:", error);
                        // For other errors, we might want to keep the local user state
                        // if we want to support offline mode, but for now let's be safe
                        if (!storedUser) {
                            localStorage.removeItem("access_token");
                            localStorage.removeItem("refresh_token");
                            setUser(null);
                        }
                    }
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string, captcha?: string, captchaId?: string) => {
        try {
            const response = await authApi.login({ email, password, captcha, captchaId });
            if (response.user) {
                setUser(response.user);
                localStorage.setItem("user", JSON.stringify(response.user));
            }
            return response;
        } catch (error) {
            throw error;
        }
    };

    const signup = async (email: string, password: string, name: string) => {
        try {
            const response = await authApi.signup({ email, password, name });
            if (response.user) {
                setUser(response.user);
                localStorage.setItem("user", JSON.stringify(response.user));
            }
            return response;
        } catch (error) {
            throw error;
        }
    };

    const verifyRegistration = async (email: string, otp: string) => {
        try {
            const response = await authApi.verifyRegistration(email, otp);
            setUser(response.user);
            localStorage.setItem("user", JSON.stringify(response.user));
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        authApi.logout();
        setUser(null);
        localStorage.removeItem("user");
        useCart.getState().clearCart();
    };

    const setAuth = useCallback((authState: { user: User; isAuthenticated: boolean }) => {
        setUser(authState.user);
        localStorage.setItem("user", JSON.stringify(authState.user));
    }, []);

    const value = {
        user,
        loading,
        login,
        signup,
        verifyRegistration,
        logout,
        isAuthenticated: !!user,
        setAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
