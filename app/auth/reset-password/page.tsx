"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { validatePasswordStrength } from "@/lib/utils/passwordValidation";
import { CheckCircle2, KeyRound } from "lucide-react";

import { Suspense } from "react";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const passwordStrength = validatePasswordStrength(password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!token) {
            setError("Token không hợp lệ");
            return;
        }

        if (password !== confirmPassword) {
            setError("Mật khẩu không khớp");
            return;
        }

        if (!passwordStrength.isStrong) {
            setError("Mật khẩu chưa đủ mạnh. Vui lòng kiểm tra các yêu cầu.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/auth/login");
                }, 2000);
            } else {
                setError(data.message || "Có lỗi xảy ra");
            }
        } catch (err) {
            setError("Không thể kết nối đến máy chủ");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen">
                <Header />
                <div className="container mx-auto py-16">
                    <div className="max-w-md mx-auto">
                        <Card className="p-8 text-center">
                            <h1 className="text-2xl font-bold mb-4">Link không hợp lệ</h1>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
                                Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
                            </p>
                            <Button onClick={() => router.push("/auth/forgot-password")}>
                                Yêu cầu link mới
                            </Button>
                        </Card>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Header />

            <div className="container mx-auto py-16">
                <div className="max-w-md mx-auto">
                    <Card className="p-8">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <KeyRound className="w-8 h-8 text-primary" />
                            </div>
                            <h1 className="text-3xl font-bold mb-2">Đặt lại mật khẩu</h1>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary">
                                Nhập mật khẩu mới cho tài khoản của bạn
                            </p>
                        </div>

                        {success ? (
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                                </div>
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400">
                                    <p className="font-semibold mb-1">Đặt lại mật khẩu thành công!</p>
                                    <p className="text-sm">
                                        Đang chuyển hướng đến trang đăng nhập...
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <Input
                                        label="Mật khẩu mới"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />

                                    <Input
                                        label="Xác nhận mật khẩu"
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />

                                    {!passwordStrength.isStrong && password && (
                                        <div className="text-xs space-y-1 p-3 bg-light-border dark:bg-dark-border rounded-lg">
                                            <p className="font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">
                                                Yêu cầu mật khẩu:
                                            </p>
                                            {passwordStrength.feedback.map((item, index) => (
                                                <div key={index} className="text-light-text-tertiary dark:text-dark-text-tertiary">
                                                    • {item}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <Button type="submit" className="w-full" size="lg" disabled={loading || !passwordStrength.isStrong}>
                                        {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                                    </Button>
                                </form>
                            </>
                        )}
                    </Card>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default function ResetPasswordPage() {
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
            <ResetPasswordContent />
        </Suspense>
    );
}
