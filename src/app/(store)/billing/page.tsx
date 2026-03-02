"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { ShoppingBag, ArrowLeft, Loader2, MapPin, Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Script from "next/script";

interface SavedAddress {
    _id: string;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
}

const billingSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().min(10, "Enter a valid phone number"),
    email: z.string().email("Enter a valid email"),
    address: z.string().min(5, "Enter your full address"),
    city: z.string().min(2, "Enter your city"),
    state: z.string().min(2, "Enter your state"),
    pincode: z.string().min(5, "Enter a valid pincode"),
    notes: z.string().optional(),
});

type BillingForm = z.infer<typeof billingSchema>;

export default function BillingPage() {
    const router = useRouter();
    const { items, getTotal, clearCart } = useCartStore();
    const { user } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | "new">("new");
    const [loadingAddresses, setLoadingAddresses] = useState(true);

    useEffect(() => { setMounted(true); }, []);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<BillingForm>({
        resolver: zodResolver(billingSchema),
        defaultValues: { phone: "", email: user?.email ?? "", fullName: user?.name ?? "" },
    });

    // Load saved addresses
    useEffect(() => {
        fetch("/api/user/addresses")
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setSavedAddresses(data);
                    const def = data.find((a: SavedAddress) => a.isDefault) ?? data[0];
                    if (def) {
                        setSelectedAddressId(def._id);
                        fillForm(def);
                    }
                }
            })
            .catch(() => {})
            .finally(() => setLoadingAddresses(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function fillForm(addr: SavedAddress) {
        setValue("fullName", addr.fullName);
        setValue("phone", addr.phone);
        setValue("address", addr.address);
        setValue("city", addr.city);
        setValue("state", addr.state);
        setValue("pincode", addr.pincode);
    }

    const handleSelectAddress = (addr: SavedAddress) => {
        setSelectedAddressId(addr._id);
        fillForm(addr);
    };

    const handleNewAddress = () => {
        setSelectedAddressId("new");
        setValue("fullName", user?.name ?? "");
        setValue("phone", "");
        setValue("address", "");
        setValue("city", "");
        setValue("state", "");
        setValue("pincode", "");
    };

    const onSubmit = async (data: BillingForm) => {
        if (items.length === 0) { toast.error("Your cart is empty!"); return; }
        setIsSubmitting(true);

        try {
            const totalAmount = getTotal();

            // Step 1: Create Razorpay order on server
            const razorpayRes = await fetch("/api/razorpay/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: totalAmount }),
            });

            const razorpayData = await razorpayRes.json();

            if (!razorpayRes.ok) {
                toast.error(razorpayData.error || "Failed to create payment order");
                setIsSubmitting(false);
                return;
            }

            // Step 2: Prepare order data for verification
            const orderData = {
                products: items.map((item) => ({
                    productId: item.id,
                    name: item.name,
                    price: item.discountPrice ?? item.price,
                    quantity: item.quantity,
                    image: item.image,
                })),
                totalAmount,
                customerDetails: data,
            };

            // Step 3: Open Razorpay checkout popup
            const options: RazorpayOptions = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
                amount: razorpayData.amount,
                currency: razorpayData.currency,
                name: "Cosmetic Store",
                description: "Order Payment",
                order_id: razorpayData.orderId,
                prefill: {
                    name: data.fullName,
                    email: data.email,
                    contact: data.phone,
                },
                theme: { color: "#ec4899" },
                handler: async (response: RazorpayResponse) => {
                    // Step 4: Verify payment on server
                    try {
                        const verifyRes = await fetch("/api/razorpay/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                orderData,
                            }),
                        });

                        const result = await verifyRes.json();

                        if (verifyRes.ok) {
                            // Save address if new
                            if (selectedAddressId === "new") {
                                fetch("/api/user/addresses", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        fullName: data.fullName,
                                        phone: data.phone,
                                        address: data.address,
                                        city: data.city,
                                        state: data.state,
                                        pincode: data.pincode,
                                    }),
                                }).catch(() => {});
                            }

                            clearCart();
                            if (result.whatsappUrl) window.open(result.whatsappUrl, "_blank");
                            router.push("/order-success");
                        } else {
                            toast.error(result.error || "Payment verification failed");
                        }
                    } catch {
                        toast.error("Something went wrong verifying payment");
                    }
                    setIsSubmitting(false);
                },
                modal: {
                    ondismiss: () => {
                        toast.error("Payment cancelled");
                        setIsSubmitting(false);
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch {
            toast.error("Something went wrong. Please try again.");
            setIsSubmitting(false);
        }
    };

    if (!mounted) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="h-8 bg-pink-50 rounded w-1/3 mb-8 animate-pulse" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-12 bg-pink-50 rounded animate-pulse" />
                        ))}
                    </div>
                    <div className="h-64 bg-pink-50 rounded animate-pulse" />
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <div className="w-24 h-24 rounded-full bg-pink-50 flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="w-10 h-10 text-pink-300" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h1>
                <p className="text-gray-400 mb-6">Add some products before checking out!</p>
                <Button asChild className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-8">
                    <Link href="/">Continue Shopping</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                <Link href="/" className="hover:text-pink-500 transition-colors">Home</Link>
                <span>/</span>
                <span className="text-gray-700">Billing</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-8" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Billing &amp; Checkout
            </h1>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Saved Addresses */}
                        {!loadingAddresses && savedAddresses.length > 0 && (
                            <div className="bg-white rounded-2xl border border-pink-100 p-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-pink-500" />
                                    Saved Addresses
                                </h2>
                                <div className="space-y-3">
                                    {savedAddresses.map((addr) => (
                                        <button
                                            key={addr._id}
                                            type="button"
                                            onClick={() => handleSelectAddress(addr)}
                                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                                selectedAddressId === addr._id
                                                    ? "border-pink-500 bg-pink-50"
                                                    : "border-pink-100 hover:border-pink-300"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-semibold text-gray-800 text-sm">{addr.fullName}</p>
                                                    <p className="text-gray-500 text-xs mt-0.5">
                                                        {addr.address}, {addr.city}, {addr.state} – {addr.pincode}
                                                    </p>
                                                    <p className="text-gray-400 text-xs mt-0.5">{addr.phone}</p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {addr.isDefault && (
                                                        <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-medium">
                                                            Default
                                                        </span>
                                                    )}
                                                    {selectedAddressId === addr._id && (
                                                        <CheckCircle2 className="w-5 h-5 text-pink-500" />
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={handleNewAddress}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                                            selectedAddressId === "new"
                                                ? "border-pink-500 bg-pink-50"
                                                : "border-dashed border-pink-200 hover:border-pink-400"
                                        }`}
                                    >
                                        <Plus className="w-5 h-5 text-pink-500" />
                                        <span className="text-sm font-medium text-gray-700">Add New Address</span>
                                        {selectedAddressId === "new" && (
                                            <CheckCircle2 className="w-5 h-5 text-pink-500 ml-auto" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Customer Details Form */}
                        <div className="bg-white rounded-2xl border border-pink-100 p-6 md:p-8">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">
                                {selectedAddressId === "new" ? "Delivery Details" : "Confirm Details"}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name *</Label>
                                    <Input id="fullName" placeholder="Enter your full name" {...register("fullName")} className="border-pink-200 focus:border-pink-400" />
                                    {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number *</Label>
                                    <Input id="phone" placeholder="Enter your phone number" {...register("phone")} className="border-pink-200 focus:border-pink-400" />
                                    {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <Label htmlFor="email">Email Address *</Label>
                                    <Input id="email" type="email" placeholder="Enter your email" {...register("email")} className="border-pink-200 focus:border-pink-400" />
                                    {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <Label htmlFor="address">Address *</Label>
                                    <Input id="address" placeholder="Enter your full address" {...register("address")} className="border-pink-200 focus:border-pink-400" />
                                    {errors.address && <p className="text-red-500 text-xs">{errors.address.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="city">City *</Label>
                                    <Input id="city" placeholder="Enter your city" {...register("city")} className="border-pink-200 focus:border-pink-400" />
                                    {errors.city && <p className="text-red-500 text-xs">{errors.city.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="state">State *</Label>
                                    <Input id="state" placeholder="Enter your state" {...register("state")} className="border-pink-200 focus:border-pink-400" />
                                    {errors.state && <p className="text-red-500 text-xs">{errors.state.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="pincode">Pincode *</Label>
                                    <Input id="pincode" placeholder="Enter your pincode" {...register("pincode")} className="border-pink-200 focus:border-pink-400" />
                                    {errors.pincode && <p className="text-red-500 text-xs">{errors.pincode.message}</p>}
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <Label htmlFor="notes">Order Notes (Optional)</Label>
                                    <Textarea id="notes" placeholder="Any special instructions..." {...register("notes")} className="border-pink-200 focus:border-pink-400 min-h-[80px]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-pink-100 p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
                            <Separator className="bg-pink-100 mb-4" />

                            <div className="space-y-3 max-h-[300px] overflow-y-auto mb-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-pink-50 shrink-0">
                                            <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</p>
                                            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-800 shrink-0">
                                            ₹{((item.discountPrice ?? item.price) * item.quantity).toFixed(0)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <Separator className="bg-pink-100 mb-4" />

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-medium">₹{getTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Shipping</span>
                                    <span className="font-medium text-green-600">Free</span>
                                </div>
                            </div>

                            <Separator className="bg-pink-100 my-4" />

                            <div className="flex justify-between text-lg font-bold mb-6">
                                <span>Total</span>
                                <span className="text-pink-500">₹{getTotal().toFixed(2)}</span>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-full py-6 text-base font-semibold shadow-lg shadow-pink-500/20"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Processing...</>
                                ) : (
                                    "Pay Now"
                                )}
                            </Button>

                            <p className="text-xs text-gray-400 text-center mt-3">
                                Secure payment via Razorpay
                            </p>
                        </div>

                        <Button variant="outline" asChild className="w-full border-pink-200 text-gray-600 rounded-full">
                            <Link href="/">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Continue Shopping
                            </Link>
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
