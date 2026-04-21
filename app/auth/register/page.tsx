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
import { validatePasswordStrength, getPasswordStrengthLabel } from "@/lib/utils/passwordValidation";
import { CheckCircle2, XCircle } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const { signup, verifyRegistration } = useAuth();
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);

    const passwordStrength = validatePasswordStrength(formData.password);
    const strengthLabel = getPasswordStrengthLabel(passwordStrength.score);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu không khớp");
            return;
        }

        if (!passwordStrength.isStrong) {
            setError("Mật khẩu chưa đủ mạnh. Vui lòng kiểm tra các yêu cầu bên dưới.");
            return;
        }

        setLoading(true);

        try {
            const response = await signup(formData.email, formData.password, formData.name);
            if (response.requireOtp) {
                setStep(2);
            } else {
                router.push("/dashboard");
            }
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Đăng ký không thành công";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await verifyRegistration(formData.email, otp);
            router.push("/dashboard");
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Xác thực OTP không thành công";
            setError(errorMessage);
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
                            <h1 className="text-3xl font-bold mb-2">Đăng ký</h1>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary">
                                Đăng ký để tham gia cộng đồng
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        {step === 1 ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    label="Tên đầy đủ"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />

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
                                        onChange={(e) => {
                                            setFormData({ ...formData, password: e.target.value });
                                            if (!passwordTouched) setPasswordTouched(true);
                                        }}
                                    />

                                    {/* Password Strength Indicator */}
                                    {passwordTouched && formData.password && (
                                        <div className="mt-3 space-y-2">
                                            {/* Strength Bar */}
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((level) => (
                                                    <div
                                                        key={level}
                                                        className={`h-1 flex-1 rounded-full transition-colors ${level <= passwordStrength.score
                                                            ? level <= 2
                                                                ? 'bg-red-500'
                                                                : level === 3
                                                                    ? 'bg-yellow-500'
                                                                    : 'bg-green-500'
                                                            : 'bg-light-border dark:bg-dark-border'
                                                            }`}
                                                    />
                                                ))}
                                            </div>

                                            {/* Strength Label */}
                                            <p className={`text-sm font-semibold ${strengthLabel.color}`}>
                                                {strengthLabel.text}
                                            </p>

                                            {/* Requirements Checklist */}
                                            {!passwordStrength.isStrong && (
                                                <div className="text-xs space-y-1 mt-2">
                                                    <p className="font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">
                                                        Yêu cầu mật khẩu:
                                                    </p>
                                                    {passwordStrength.feedback.map((item, index) => (
                                                        <div key={index} className="flex items-center gap-2 text-light-text-tertiary dark:text-dark-text-tertiary">
                                                            <XCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                                                            <span>{item}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {passwordStrength.isStrong && (
                                                <div className="flex items-center gap-2 text-green-600 text-sm">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span>Mật khẩu đủ mạnh!</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <Input
                                    label="Xác nhận mật khẩu"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />

                                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                                    {loading ? "Đang xử lý..." : "Tiếp tục"}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <div className="text-center mb-4">
                                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                        Mã xác thực đã được gửi đến email <strong>{formData.email}</strong>
                                    </p>
                                </div>
                                <Input
                                    label="Mã OTP"
                                    type="text"
                                    required
                                    placeholder="Nhập mã 6 số"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="text-center text-2xl tracking-widest"
                                />
                                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                                    {loading ? "Đang xác thực..." : "Xác thực"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => setStep(1)}
                                    disabled={loading}
                                >
                                    Quay lại
                                </Button>
                            </form>
                        )}

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-light-border dark:border-dark-border"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-light-bg dark:bg-dark-bg text-light-text-secondary dark:text-dark-text-secondary">
                                    Hoặc đăng ký với
                                </span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            size="lg"
                            onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/google`}
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Đăng ký với Google
                        </Button>

                        <p className="text-center mt-6 text-sm">
                            Bạn đã có tài khoản?{" "}
                            <Link href="/auth/login" className="text-primary hover:text-primary-600 font-semibold">
                                Đăng nhập
                            </Link>
                        </p>
                    </Card>
                </div>
            </div>

            <Footer />
        </div>
    );
}
