"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { login, logout, setLoading } = useAuthStore();

    useEffect(() => {
        setLoading(true);
        fetch("/api/auth/me")
            .then((r) => r.json())
            .then(({ user }) => {
                if (user) login(user);
                else logout();
            })
            .catch(() => logout());
    }, [login, logout, setLoading]);

    return <>{children}</>;
}
