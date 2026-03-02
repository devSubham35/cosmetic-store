"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

export function CartDrawer() {
    const { items, isOpen, closeCart, removeItem, updateQuantity, getTotal } = useCartStore();
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();

    const handleCheckout = () => {
        closeCart();
        if (isAuthenticated) {
            router.push("/billing");
        } else {
            router.push("/login?redirect=/billing");
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={closeCart}>
            <SheetContent className="w-full sm:max-w-md flex flex-col bg-white p-0">
                <SheetHeader className="px-6 py-4 border-b border-pink-100">
                    <SheetTitle className="flex items-center gap-2 text-xl">
                        <ShoppingBag className="w-5 h-5 text-pink-500" />
                        Shopping Cart
                        <span className="text-sm font-normal text-gray-400">
                            ({items.length} {items.length === 1 ? "item" : "items"})
                        </span>
                    </SheetTitle>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
                        <div className="w-24 h-24 rounded-full bg-pink-50 flex items-center justify-center">
                            <ShoppingBag className="w-10 h-10 text-pink-300" />
                        </div>
                        <p className="text-gray-500 text-center">Your cart is empty</p>
                        <Button
                            onClick={closeCart}
                            className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-8"
                        >
                            Continue Shopping
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                            {items.map((item) => {
                                const effectivePrice = item.discountPrice ?? item.price;
                                return (
                                    <div key={item.id} className="flex gap-3 animate-fade-in-up">
                                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-pink-50 shrink-0">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                                sizes="80px"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                href={`/product/${item.slug}`}
                                                className="text-sm font-medium text-gray-800 hover:text-pink-500 transition-colors line-clamp-1"
                                                onClick={closeCart}
                                            >
                                                {item.name}
                                            </Link>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-sm font-bold text-pink-500">₹{effectivePrice}</span>
                                                {item.discountPrice && (
                                                    <span className="text-xs text-gray-400 line-through">₹{item.price}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-1 border border-pink-200 rounded-full">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="p-1 hover:bg-pink-50 rounded-full transition-colors"
                                                        aria-label="Decrease quantity"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="p-1 hover:bg-pink-50 rounded-full transition-colors"
                                                        aria-label="Increase quantity"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                                    aria-label="Remove item"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="border-t border-pink-100 px-6 py-4 space-y-3 bg-pink-50/50">
                            <div className="flex items-center justify-between text-lg">
                                <span className="font-medium text-gray-600">Subtotal:</span>
                                <span className="font-bold text-gray-800">₹{getTotal().toFixed(2)}</span>
                            </div>
                            <Separator className="bg-pink-200" />
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    onClick={closeCart}
                                    className="rounded-full border-pink-300 text-pink-500 hover:bg-pink-50"
                                >
                                    Continue Shopping
                                </Button>
                                <Button
                                    onClick={handleCheckout}
                                    className="rounded-full bg-pink-500 hover:bg-pink-600 text-white"
                                >
                                    Checkout <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
