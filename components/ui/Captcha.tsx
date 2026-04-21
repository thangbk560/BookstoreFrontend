"use client";

import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

interface CaptchaProps {
    onVerify: (isValid: boolean) => void;
}

export function MathCaptcha({ onVerify }: CaptchaProps) {
    const [num1, setNum1] = useState(0);
    const [num2, setNum2] = useState(0);
    const [userAnswer, setUserAnswer] = useState("");
    const [error, setError] = useState("");

    const generateCaptcha = () => {
        setNum1(Math.floor(Math.random() * 10) + 1);
        setNum2(Math.floor(Math.random() * 10) + 1);
        setUserAnswer("");
        setError("");
    };

    useEffect(() => {
        generateCaptcha();
    }, []);

    const handleVerify = () => {
        const correctAnswer = num1 + num2;
        const isValid = parseInt(userAnswer) === correctAnswer;

        if (isValid) {
            setError("");
            onVerify(true);
        } else {
            setError("Sai kết quả. Vui lòng thử lại.");
            onVerify(false);
            generateCaptcha();
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-light-border dark:bg-dark-border rounded-lg">
                <div className="flex items-center gap-2 text-lg font-semibold">
                    <span>{num1}</span>
                    <span>+</span>
                    <span>{num2}</span>
                    <span>=</span>
                </div>
                <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => {
                        setUserAnswer(e.target.value);
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val === num1 + num2) {
                            handleVerify();
                        }
                    }}
                    placeholder="?"
                    className="w-16 px-3 py-2 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary text-center"
                />
                <button
                    type="button"
                    onClick={generateCaptcha}
                    className="p-2 hover:bg-light-bg dark:hover:bg-dark-bg rounded-lg transition-colors"
                    title="Tạo lại CAPTCHA"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>
            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}
        </div>
    );
}
