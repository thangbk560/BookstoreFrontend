"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CheckCircle, Package, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

export default function OrderConfirmationPage() {
    const [] = useState(5);

    useEffect(() => {
        // Trigger confetti
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
        }

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />

            <div className="container mx-auto py-16 px-4">
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="p-8 md:p-12 text-center overflow-hidden relative">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 20,
                                    delay: 0.1
                                }}
                                className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8"
                            >
                                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-3xl md:text-4xl font-bold mb-4 text-light-text-primary dark:text-dark-text-primary"
                            >
                                Đặt hàng thành công!
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-lg text-light-text-secondary dark:text-dark-text-secondary mb-8 max-w-md mx-auto"
                            >
                                Cảm ơn bạn đã mua sắm tại Bookstore. Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="flex flex-col sm:flex-row gap-4 justify-center"
                            >
                                <Link href="/dashboard?tab=orders">
                                    <Button size="lg" className="w-full sm:w-auto flex items-center justify-center gap-2 min-w-[200px]">
                                        <Package className="w-5 h-5" />
                                        Xem đơn hàng
                                    </Button>
                                </Link>

                                <Link href="/books">
                                    <Button variant="outline" size="lg" className="w-full sm:w-auto flex items-center justify-center gap-2 min-w-[200px]">
                                        <ShoppingBag className="w-5 h-5" />
                                        Tiếp tục mua sắm
                                    </Button>
                                </Link>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="mt-8 pt-8 border-t border-light-border dark:border-dark-border"
                            >
                                <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                                    Mọi thắc mắc xin vui lòng liên hệ hotline: <span className="font-semibold text-primary">1900 1234</span>
                                </p>
                            </motion.div>
                        </Card>
                    </motion.div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
