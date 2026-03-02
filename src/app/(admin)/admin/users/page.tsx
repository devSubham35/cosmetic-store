"use client";

import { useMemo, useState } from "react";
import { Users, Search, Shield, User as UserIcon, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePaginatedFetch } from "@/lib/use-paginated-fetch";
import CommonTable from "@/components/admin/CommonTable";
import { type ColumnDef } from "@tanstack/react-table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { useAdminTheme } from "@/context/AdminThemeContext";

interface AdminUser {
    _id: string;
    email: string;
    name?: string;
    role: "user" | "admin";
    createdAt: string;
}

const roleStyles: Record<string, string> = {
    admin: "bg-pink-100 text-pink-700",
    user: "bg-gray-100 text-gray-600",
};

// ─── User Detail Modal ───────────────────────────────────────────────────────

function UserDetailModal({ user, open, onOpenChange, isDark }: {
    user: AdminUser | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isDark: boolean;
}) {
    if (!user) return null;
    const initial = user.name?.[0]?.toUpperCase() ?? user.email[0]?.toUpperCase() ?? "U";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={`sm:max-w-[420px] ${isDark ? "bg-[#1a1d2e] border-white/10 text-white" : ""}`}>
                <DialogHeader>
                    <DialogTitle className={isDark ? "text-white" : ""}>User Details</DialogTitle>
                    <DialogDescription>Account information</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center gap-3 py-2">
                    <div className="w-16 h-16 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-2xl">
                        {initial}
                    </div>
                    <div className="text-center">
                        <p className={`font-semibold text-lg ${isDark ? "text-white" : "text-gray-800"}`}>
                            {user.name || <span className="text-gray-400 italic">No name</span>}
                        </p>
                        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{user.email}</p>
                    </div>
                    <Badge className={`${roleStyles[user.role]} border-0 gap-1 text-xs font-semibold`}>
                        {user.role === "admin" ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                        {user.role}
                    </Badge>
                </div>

                <div className={`rounded-xl p-4 space-y-2 text-sm ${isDark ? "bg-white/5" : "bg-pink-50/50"}`}>
                    <div className="flex justify-between">
                        <span className={isDark ? "text-gray-500" : "text-gray-400"}>User ID</span>
                        <span className={`font-mono text-xs ${isDark ? "text-gray-300" : "text-gray-700"}`}>{user._id}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className={isDark ? "text-gray-500" : "text-gray-400"}>Role</span>
                        <span className={`capitalize ${isDark ? "text-gray-300" : "text-gray-700"}`}>{user.role}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className={isDark ? "text-gray-500" : "text-gray-400"}>Joined</span>
                        <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                            {new Date(user.createdAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                            })}
                        </span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
    const { isDark } = useAdminTheme();
    const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

    const filters = {
        role: roleFilter === "all" ? "" : roleFilter,
    };

    const {
        data: users,
        meta,
        loading,
        search,
        setSearch,
        setPage,
        limit,
        setLimit,
    } = usePaginatedFetch<AdminUser>({
        baseUrl: "/api/admin/users",
        filters,
    });

    const columns = useMemo<ColumnDef<AdminUser>[]>(() => [
        {
            accessorKey: "name",
            header: "User",
            cell: ({ row }) => {
                const user = row.original;
                const initial = user.name?.[0]?.toUpperCase() ?? user.email[0]?.toUpperCase() ?? "U";
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {initial}
                        </div>
                        <span className={`font-medium text-sm truncate ${isDark ? "text-white" : "text-gray-800"}`}>
                            {user.name || <span className="text-gray-400 italic">No name</span>}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => (
                <span className={`text-sm truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>{row.original.email}</span>
            ),
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => (
                <Badge className={`${roleStyles[row.original.role]} border-0 gap-1 text-xs font-semibold`}>
                    {row.original.role === "admin"
                        ? <Shield className="w-3 h-3" />
                        : <UserIcon className="w-3 h-3" />}
                    {row.original.role}
                </Badge>
            ),
        },
        {
            accessorKey: "createdAt",
            header: "Joined",
            cell: ({ row }) => (
                <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    {new Date(row.original.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    })}
                </span>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <button
                    onClick={() => setSelectedUser(row.original)}
                    className={`p-2 rounded-lg transition-colors ${isDark ? "text-gray-400 hover:text-pink-400 hover:bg-white/5" : "text-gray-400 hover:text-pink-500 hover:bg-pink-50"}`}
                    aria-label="View user details"
                >
                    <Eye className="w-4 h-4" />
                </button>
            ),
        },
    ], [isDark]);

    return (
        <div>
            <div className="mb-8">
                <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-800"}`} style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Users
                </h1>
                <p className={`mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>{meta?.total ?? 0} registered users</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`pl-9 rounded-xl ${isDark ? "border-white/10 bg-white/5 text-white placeholder:text-gray-500" : "border-pink-200 focus:border-pink-400"}`}
                    />
                </div>
                <div className="flex gap-2">
                    {(["all", "user", "admin"] as const).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRoleFilter(r)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                                roleFilter === r
                                    ? isDark
                                        ? "bg-pink-500 text-white border-transparent shadow-lg shadow-pink-500/20"
                                        : "bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-200"
                                    : isDark
                                        ? "bg-white/5 text-gray-400 border-white/5 hover:border-white/10"
                                        : "bg-white text-gray-600 border-pink-100 hover:border-pink-300"
                            }`}
                        >
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <CommonTable
                columns={columns}
                data={users}
                meta={meta}
                loading={loading}
                onPageChange={setPage}
                limit={limit}
                onLimitChange={setLimit}
                emptyIcon={
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? "bg-pink-500/10" : "bg-pink-50"}`}>
                        <Users className="w-7 h-7 text-pink-300" />
                    </div>
                }
                emptyMessage={
                    !search && roleFilter === "all"
                        ? "No users yet. Users will appear here once they sign up."
                        : "No users matching your filters."
                }
            />

            <UserDetailModal
                user={selectedUser}
                open={!!selectedUser}
                onOpenChange={(open) => { if (!open) setSelectedUser(null); }}
                isDark={isDark}
            />
        </div>
    );
}
