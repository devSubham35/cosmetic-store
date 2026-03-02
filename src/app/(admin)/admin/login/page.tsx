"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { useAdminTheme } from "@/context/AdminThemeContext";
import { Loader2, Mail, ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/admin/dashboard";
    const { login, user, isAuthenticated } = useAuthStore();
    const { isDark } = useAdminTheme();

    const [step, setStep] = useState<"email" | "otp">("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (isAuthenticated && user?.role === "admin") {
            router.replace(redirect);
        }
    }, [isAuthenticated, user, redirect, router]);

    useEffect(() => {
        if (resendTimer <= 0) return;
        const id = setTimeout(() => setResendTimer((t) => t - 1), 1000);
        return () => clearTimeout(id);
    }, [resendTimer]);

    const handleSendOTP = async (e?: React.SyntheticEvent) => {
        e?.preventDefault();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            toast.error("Enter a valid email address");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setStep("otp");
            setResendTimer(60);
            toast.success(`OTP sent to ${email.trim()}`);
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to send OTP";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = useCallback(async (digits: string[]) => {
        const code = digits.join("");
        if (code.length < 6) return;

        setLoading(true);
        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), otp: code, requireAdmin: true }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            login(data.user);
            toast.success("Welcome back, Admin!");
            router.replace(redirect);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Verification failed";
            toast.error(msg);
            setOtp(["", "", "", "", "", ""]);
            otpRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    }, [email, login, router, redirect]);

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
        if (newOtp.every((d) => d !== "")) handleVerifyOTP(newOtp);
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length === 6) {
            const digits = pasted.split("");
            setOtp(digits);
            otpRefs.current[5]?.focus();
            handleVerifyOTP(digits);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center px-4 py-12 ${isDark ? "bg-[#0f1117]" : "bg-gray-50"}`}>
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <span className="text-3xl font-bold italic" style={{ color: "#ff4d8d", fontFamily: "'Outfit', sans-serif" }}>
                        Admin Panel
                    </span>
                </div>

                <div className={`rounded-3xl shadow-xl overflow-hidden ${isDark ? "bg-[#161822] border border-white/10 shadow-black/20" : "bg-white border border-pink-100 shadow-pink-100"}`}>
                    {/* Header band */}
                    <div className="bg-pink-500 px-8 py-6 text-white text-center">
                        {step === "email" ? (
                            <>
                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <Mail className="w-7 h-7" />
                                </div>
                                <h1 className="text-2xl font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>Admin Login</h1>
                                <p className="text-pink-100 text-sm mt-1">Enter your admin email to continue</p>
                            </>
                        ) : (
                            <>
                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <ShieldCheck className="w-7 h-7" />
                                </div>
                                <h1 className="text-2xl font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>Verify OTP</h1>
                                <p className="text-pink-100 text-sm mt-1">Sent to {email}</p>
                            </>
                        )}
                    </div>

                    <div className="px-8 py-8">
                        {step === "email" ? (
                            <form onSubmit={handleSendOTP} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                        Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={`rounded-xl h-12 text-base ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-pink-400" : "border-pink-200 focus:border-pink-400"}`}
                                        autoFocus
                                    />
                                    <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                        We&apos;ll send a 6-digit OTP to this email
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading || !email.trim()}
                                    className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-xl h-12 text-base font-semibold shadow-md shadow-pink-500/20"
                                >
                                    {loading ? (
                                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending OTP...</>
                                    ) : (
                                        "Send OTP"
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <p className={`text-sm font-medium mb-4 text-center ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                        Enter the 6-digit code
                                    </p>

                                    <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                                        {otp.map((digit, i) => (
                                            <input
                                                key={i}
                                                ref={(el) => { otpRefs.current[i] = el; }}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(i, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                                disabled={loading}
                                                className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 focus:outline-none transition-all disabled:opacity-50 ${isDark
                                                    ? "bg-white/5 border-white/10 text-white focus:border-pink-400"
                                                    : "border-pink-200 focus:border-pink-500 bg-pink-50/50"
                                                }`}
                                                style={{ caretColor: "#ec4899" }}
                                            />
                                        ))}
                                    </div>

                                    {loading && (
                                        <div className="flex items-center justify-center gap-2 mt-4 text-pink-500">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span className="text-sm">Verifying...</span>
                                        </div>
                                    )}
                                </div>

                                {/* Resend */}
                                <div className="text-center">
                                    {resendTimer > 0 ? (
                                        <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                            Resend OTP in <span className="text-pink-500 font-medium">{resendTimer}s</span>
                                        </p>
                                    ) : (
                                        <button
                                            onClick={() => handleSendOTP()}
                                            disabled={loading}
                                            className="text-sm text-pink-500 hover:text-pink-600 font-medium underline-offset-2 hover:underline disabled:opacity-50"
                                        >
                                            Resend OTP
                                        </button>
                                    )}
                                </div>

                                {/* Back */}
                                <button
                                    onClick={() => { setStep("email"); setOtp(["", "", "", "", "", ""]); }}
                                    className={`flex items-center gap-1.5 text-sm transition-colors mx-auto ${isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Change email
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
