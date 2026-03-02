"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Theme = "dark" | "light";

interface AdminThemeContextValue {
    theme: Theme;
    isDark: boolean;
    toggleTheme: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextValue>({
    theme: "dark",
    isDark: true,
    toggleTheme: () => {},
});

const STORAGE_KEY = "admin-theme";

export function AdminThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>("dark");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
        if (stored === "light" || stored === "dark") {
            setTheme(stored);
        }
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        setTheme((prev) => {
            const next = prev === "dark" ? "light" : "dark";
            localStorage.setItem(STORAGE_KEY, next);
            return next;
        });
    };

    // Prevent flash of wrong theme
    if (!mounted) {
        return <div style={{ visibility: "hidden" }}>{children}</div>;
    }

    return (
        <AdminThemeContext.Provider value={{ theme, isDark: theme === "dark", toggleTheme }}>
            {children}
        </AdminThemeContext.Provider>
    );
}

export function useAdminTheme() {
    return useContext(AdminThemeContext);
}
