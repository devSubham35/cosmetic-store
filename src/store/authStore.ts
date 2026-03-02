import { create } from "zustand";

export interface AuthUser {
    _id: string;
    email: string;
    name?: string;
    role: string;
}

interface AuthStore {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (user: AuthUser) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    login: (user) => set({ user, isAuthenticated: true, isLoading: false }),
    logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
    setLoading: (loading) => set({ isLoading: loading }),
}));
