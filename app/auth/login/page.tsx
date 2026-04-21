"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/contexts/AuthContext";
import { authApi } from "@/lib/api/auth";
import { RefreshCw } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [captchaImage, setCaptchaImage] = useState("");
    const [captchaId, setCaptchaId] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");
    const [accountLocked, setAccountLocked] = useState(false);

    const fetchCaptcha = async () => {
        try {
            const data = await authApi.getCaptcha();
            setCaptchaImage(data.image);
            setCaptchaId(data.id);
            setCaptchaInput("");
        } catch (error) {
            console.error("Failed to fetch CAPTCHA", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (showCaptcha && !captchaInput) {
            setError("Vui lòng nhập mã CAPTCHA");
            return;
        }

        setLoading(true);

        try {
            const response = await login(formData.email, formData.password, captchaInput, captchaId);

            if (response.requireCaptcha) {
                setShowCaptcha(true);
                setError(response.message || "Vui lòng nhập CAPTCHA");
                await fetchCaptcha();
                setLoading(false);
                return;
            }

            router.push("/dashboard");
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Đăng nhập không thành công";
            setError(errorMessage);

            // Check if account is locked
            if (errorMessage.includes("locked")) {
                setAccountLocked(true);
            } else if (errorMessage.includes("CAPTCHA")) {
                setShowCaptcha(true);
                await fetchCaptcha();
            } else {
                // Increment failed attempts
                const newFailedAttempts = failedAttempts + 1;
                setFailedAttempts(newFailedAttempts);

                // Show CAPTCHA after 3 failed attempts
                if (newFailedAttempts >= 3) {
                    setShowCaptcha(true);
                    await fetchCaptcha();
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <Header />

            <div className="container mx-auto py-16">
                <div className="max-w-md mx-auto">
                    <Card className="p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold mb-2">Chào mừng trở lại</h1>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary">
                                Đăng nhập vào tài khoản
                            </p>
                        </div>

                        {error && (
                            <div className={`mb-6 p-4 border rounded-lg ${accountLocked
                                ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400'
                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                                }`}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />

                            <div>
                                <Input
                                    label="Mật khẩu"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <div className="text-right mt-2">
                                    <Link
                                        href="/auth/forgot-password"
                                        className="text-sm text-primary hover:text-primary-600"
                                    >
                                        Quên mật khẩu?
                                    </Link>
                                </div>
                            </div>

                            {showCaptcha && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                                        Mã xác nhận
                                    </label>
                                    <div className="flex gap-2">
                                        <div
                                            className="flex-1 bg-gray-100 rounded p-2 flex items-center justify-center overflow-hidden"
                                            dangerouslySetInnerHTML={{ __html: captchaImage }}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="p-2 h-10 w-10"
                                            onClick={fetchCaptcha}
                                            title="Lấy mã mới"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <Input
                                        placeholder="Nhập mã xác nhận"
                                        value={captchaInput}
                                        onChange={(e) => setCaptchaInput(e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                disabled={loading || accountLocked}
                            >
                                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                            </Button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-light-border dark:border-dark-border"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-light-bg dark:bg-dark-bg text-light-text-secondary dark:text-dark-text-secondary">
                                    Hoặc đăng nhập với
                                </span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full flex items-center justify-center gap-2"
                            onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Đăng nhập với Google
                        </Button>

                        <p className="text-center mt-6 text-sm">
                            Bạn chưa có tài khoản?{" "}
                            <Link href="/auth/register" className="text-primary hover:text-primary-600 font-semibold">
                                Đăng ký
                            </Link>
                        </p>
                    </Card>
                </div>
            </div>

            <Footer />
        </div>
    );
}
