"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Plus, Pencil, Trash2, Star, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface Address {
    _id: string;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
}

const addressSchema = z.object({
    fullName: z.string().min(2, "Name required"),
    phone: z.string().min(10, "Valid phone required"),
    address: z.string().min(5, "Address required"),
    city: z.string().min(2, "City required"),
    state: z.string().min(2, "State required"),
    pincode: z.string().min(5, "Pincode required"),
});

type AddressForm = z.infer<typeof addressSchema>;

export default function AddressesPage() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<AddressForm>({
        resolver: zodResolver(addressSchema),
    });

    const fetchAddresses = () => {
        fetch("/api/user/addresses")
            .then((r) => r.json())
            .then((data) => { if (Array.isArray(data)) setAddresses(data); })
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchAddresses(); }, []);

    const openAdd = () => { setEditId(null); reset({}); setShowForm(true); };
    const openEdit = (addr: Address) => {
        setEditId(addr._id);
        reset({ fullName: addr.fullName, phone: addr.phone, address: addr.address, city: addr.city, state: addr.state, pincode: addr.pincode });
        setShowForm(true);
    };

    const onSubmit = async (data: AddressForm) => {
        setSaving(true);
        try {
            const url = editId ? `/api/user/addresses/${editId}` : "/api/user/addresses";
            const method = editId ? "PATCH" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to save address");
            toast.success(editId ? "Address updated!" : "Address added!");
            setShowForm(false);
            fetchAddresses();
        } catch {
            toast.error("Failed to save address");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this address?")) return;
        try {
            await fetch(`/api/user/addresses/${id}`, { method: "DELETE" });
            toast.success("Address deleted");
            fetchAddresses();
        } catch {
            toast.error("Failed to delete");
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            await fetch(`/api/user/addresses/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isDefault: true }),
            });
            toast.success("Default address updated");
            fetchAddresses();
        } catch {
            toast.error("Failed to update");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">My Addresses</h2>
                {!showForm && (
                    <Button onClick={openAdd} className="bg-pink-500 hover:bg-pink-600 text-white rounded-xl gap-2">
                        <Plus className="w-4 h-4" /> Add Address
                    </Button>
                )}
            </div>

            {/* Add / Edit Form */}
            {showForm && (
                <div className="bg-white rounded-2xl border-2 border-pink-200 p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-semibold text-gray-800">{editId ? "Edit Address" : "New Address"}</h3>
                        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Full Name *</Label>
                            <Input placeholder="Full name" {...register("fullName")} className="border-pink-200 focus:border-pink-400" />
                            {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Phone *</Label>
                            <Input placeholder="Phone number" {...register("phone")} className="border-pink-200 focus:border-pink-400" />
                            {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                            <Label>Address *</Label>
                            <Input placeholder="House no, Street, Area" {...register("address")} className="border-pink-200 focus:border-pink-400" />
                            {errors.address && <p className="text-red-500 text-xs">{errors.address.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>City *</Label>
                            <Input placeholder="City" {...register("city")} className="border-pink-200 focus:border-pink-400" />
                            {errors.city && <p className="text-red-500 text-xs">{errors.city.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>State *</Label>
                            <Input placeholder="State" {...register("state")} className="border-pink-200 focus:border-pink-400" />
                            {errors.state && <p className="text-red-500 text-xs">{errors.state.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Pincode *</Label>
                            <Input placeholder="6-digit pincode" {...register("pincode")} className="border-pink-200 focus:border-pink-400" />
                            {errors.pincode && <p className="text-red-500 text-xs">{errors.pincode.message}</p>}
                        </div>

                        <div className="md:col-span-2 flex gap-3 pt-2">
                            <Button type="submit" disabled={saving} className="bg-pink-500 hover:bg-pink-600 text-white rounded-xl">
                                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save Address"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-pink-200 rounded-xl">
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Address list */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2].map((i) => <div key={i} className="h-24 bg-pink-50 rounded-2xl animate-pulse" />)}
                </div>
            ) : addresses.length === 0 && !showForm ? (
                <div className="bg-white rounded-2xl border border-pink-100 p-12 text-center">
                    <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 text-pink-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">No addresses saved</h3>
                    <p className="text-gray-400 text-sm mb-4">Add an address for faster checkout</p>
                    <Button onClick={openAdd} className="bg-pink-500 hover:bg-pink-600 text-white rounded-xl gap-2">
                        <Plus className="w-4 h-4" /> Add Address
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {addresses.map((addr) => (
                        <div key={addr._id} className={`bg-white rounded-2xl border-2 p-5 transition-all ${addr.isDefault ? "border-pink-300" : "border-pink-100"}`}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-semibold text-gray-800">{addr.fullName}</p>
                                        {addr.isDefault && (
                                            <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-pink-500" /> Default
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">{addr.address}</p>
                                    <p className="text-sm text-gray-600">{addr.city}, {addr.state} – {addr.pincode}</p>
                                    <p className="text-xs text-gray-400 mt-1">{addr.phone}</p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {!addr.isDefault && (
                                        <button
                                            onClick={() => handleSetDefault(addr._id)}
                                            className="text-xs text-pink-500 hover:text-pink-600 font-medium border border-pink-200 px-2.5 py-1 rounded-lg hover:bg-pink-50 transition-all"
                                        >
                                            Set default
                                        </button>
                                    )}
                                    <button
                                        onClick={() => openEdit(addr)}
                                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(addr._id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
