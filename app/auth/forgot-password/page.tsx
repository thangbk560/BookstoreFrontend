"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:3001/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setSent(true);
            } else {
                setError(data.message || "Có lỗi xảy ra");
            }
        } catch (err) {
            setError("Không thể kết nối đến máy chủ");
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
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8 text-primary" />
                            </div>
                            <h1 className="text-3xl font-bold mb-2">Quên mật khẩu?</h1>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary">
                                Nhập email của bạn để nhận link đặt lại mật khẩu
                            </p>
                        </div>

                        {sent ? (
                            <div className="text-center space-y-4">
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400">
                                    <p className="font-semibold mb-1">Email đã được gửi!</p>
                                    <p className="text-sm">
                                        Vui lòng kiểm tra hộp thư để nhận link đặt lại mật khẩu.
                                    </p>
                                </div>
                                <Link href="/auth/login" className="text-primary hover:text-primary-600 font-semibold block">
                                    Quay lại đăng nhập
                                </Link>
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
                                        label="Email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="email@example.com"
                                    />

                                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                                        {loading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
                                    </Button>
                                </form>

                                <p className="text-center mt-6 text-sm">
                                    Nhớ mật khẩu?{" "}
                                    <Link href="/auth/login" className="text-primary hover:text-primary-600 font-semibold">
                                        Đăng nhập
                                    </Link>
                                </p>
                            </>
                        )}
                    </Card>
                </div>
            </div>

            <Footer />
        </div>
    );
}
