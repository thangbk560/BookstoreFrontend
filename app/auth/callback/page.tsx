"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { authApi } from "@/lib/api/auth";

import { Suspense } from "react";

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setAuth } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            const access_token = searchParams.get('access_token');
            const refresh_token = searchParams.get('refresh_token');

            if (access_token && refresh_token) {
                try {
                    // Store tokens FIRST before making any API calls
                    localStorage.setItem('access_token', access_token);
                    localStorage.setItem('refresh_token', refresh_token);

                    // Small delay to ensure localStorage is fully written
                    await new Promise(resolve => setTimeout(resolve, 50));

                    // Now fetch user data using the authApi client (which will use the stored token)
                    const userData = await authApi.getCurrentUser();

                    // Store user data and update auth state
                    setAuth({
                        user: userData,
                        isAuthenticated: true,
                    });

                    // Redirect to dashboard
                    router.push('/dashboard');
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    // Fallback: decode token to get minimal user info
                    try {
                        const payload = JSON.parse(atob(access_token.split('.')[1]));
                        setAuth({
                            user: {
                                id: payload.sub,
                                email: payload.email,
                                name: payload.name || payload.email,
                                role: payload.role || 'user',
                            },
                            isAuthenticated: true,
                        });
                        router.push('/dashboard');
                    } catch (decodeError) {
                        console.error('Error decoding token:', decodeError);
                        // Clear invalid tokens
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                        router.push('/auth/login');
                    }
                }
            } else {
                // No tokens, redirect to login
                router.push('/auth/login');
            }
        };

        handleCallback();
    }, [searchParams, router, setAuth]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                    Đang xác thực...
                </p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">
                        Đang tải...
                    </p>
                </div>
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}
