"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email").or(z.literal("")),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const { user, login } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: { name: user?.name ?? "", email: user?.email ?? "" },
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

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">My Profile</h2>

            <div className="bg-white rounded-2xl border border-pink-100 p-6 md:p-8">
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-pink-100">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-bold text-2xl">
                        {user?.name?.[0]?.toUpperCase() ?? user?.phone?.[0] ?? "U"}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">{user?.name || "Add your name"}</p>
                        <p className="text-sm text-gray-400">+91 {user?.phone}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="phone-readonly">Phone Number</Label>
                        <Input
                            id="phone-readonly"
                            value={`+91 ${user?.phone ?? ""}`}
                            readOnly
                            className="border-pink-100 bg-pink-50/50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400">Phone number cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            placeholder="Enter your name"
                            {...register("name")}
                            className="border-pink-200 focus:border-pink-400"
                        />
                        {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            {...register("email")}
                            className="border-pink-200 focus:border-pink-400"
                        />
                        {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
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
