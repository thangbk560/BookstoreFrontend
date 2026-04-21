export interface PasswordStrength {
    score: number; // 0-4
    feedback: string[];
    isStrong: boolean;
}

export function validatePasswordStrength(password: string): PasswordStrength {
    const feedback: string[] = [];
    let score = 0;

    // Minimum length check
    if (password.length >= 8) {
        score++;
    } else {
        feedback.push("Mật khẩu phải có ít nhất 8 ký tự");
    }

    // Uppercase letter check
    if (/[A-Z]/.test(password)) {
        score++;
    } else {
        feedback.push("Cần ít nhất 1 chữ cái viết hoa");
    }

    // Lowercase letter check
    if (/[a-z]/.test(password)) {
        score++;
    } else {
        feedback.push("Cần ít nhất 1 chữ cái viết thường");
    }

    // Number check
    if (/[0-9]/.test(password)) {
        score++;
    } else {
        feedback.push("Cần ít nhất 1 chữ số");
    }

    // Special character check
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        score++;
    } else {
        feedback.push("Cần ít nhất 1 ký tự đặc biệt (!@#$%^&* etc.)");
    }

    const isStrong = score >= 5;

    return { score, feedback, isStrong };
}

export function getPasswordStrengthLabel(score: number): { text: string; color: string } {
    if (score === 0) return { text: "Rất yếu", color: "text-red-600" };
    if (score <= 2) return { text: "Yếu", color: "text-orange-600" };
    if (score === 3) return { text: "Trung bình", color: "text-yellow-600" };
    if (score === 4) return { text: "Mạnh", color: "text-green-600" };
    return { text: "Rất mạnh", color: "text-green-700" };
}
