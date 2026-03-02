"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { useAdminTheme } from "@/context/AdminThemeContext";
import { Loader2, CheckCircle2, Shield } from "lucide-react";
import { toast } from "sonner";

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function AdminProfilePage() {
    const { user, login } = useAuthStore();
    const { isDark } = useAdminTheme();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: { name: user?.name ?? "" },
    });

    const onSubmit = async (data: ProfileForm) => {
        setLoading(true);
        try {
            const res = await fetch("/api/user", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            login(result.user);
            toast.success("Profile updated!");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to update");
        } finally {
            setLoading(false);
        }
    };

    const initials = user?.name
        ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
        : user?.email?.[0]?.toUpperCase() ?? "A";

    return (
        <div className="space-y-6 max-w-2xl">
            <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"}`} style={{ fontFamily: "'Outfit', sans-serif" }}>
                My Profile
            </h2>

            <div className={`rounded-2xl border p-6 md:p-8 ${isDark ? "bg-[#161822] border-white/10" : "bg-white border-pink-100"}`}>
                {/* Avatar + Info Header */}
                <div className={`flex items-center gap-4 mb-8 pb-6 border-b ${isDark ? "border-white/10" : "border-pink-100"}`}>
                    <div className="w-16 h-16 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className={`font-semibold text-lg ${isDark ? "text-white" : "text-gray-800"}`}>
                            {user?.name || "Admin User"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-500">
                                <Shield className="w-3 h-3" />
                                Admin
                            </span>
                            <span className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                {user?.email}
                            </span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="name" className={isDark ? "text-gray-300" : ""}>Full Name</Label>
                        <Input
                            id="name"
                            placeholder="Enter your name"
                            {...register("name")}
                            className={`rounded-xl ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-pink-400" : "border-pink-200 focus:border-pink-400"}`}
                        />
                        {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email-readonly" className={isDark ? "text-gray-300" : ""}>Email Address</Label>
                        <Input
                            id="email-readonly"
                            value={user?.email ?? ""}
                            readOnly
                            className={`rounded-xl cursor-not-allowed ${isDark ? "bg-white/5 border-white/10 text-gray-500" : "border-pink-100 bg-pink-50/50 text-gray-500"}`}
                        />
                        <p className={`text-xs ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                            Email is your login identifier and cannot be changed
                        </p>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-pink-500 hover:bg-pink-600 text-white rounded-xl px-8"
                    >
                        {loading ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                        ) : (
                            <><CheckCircle2 className="w-4 h-4 mr-2" />Save Changes</>
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
