"use client";

import Link from "next/link";

const promos = [
    {
        title: "Get Your 50% Off",
        subtitle: "Nourish your skin with toxin-free cosmetic products.",
        cta: "Shop Now",
        href: "/category/skin-care",
        bg: "from-orange-50 to-pink-50",
        emoji: "",
        accent: "bg-pink-500",
    },
    {
        title: "Check This Out",
        subtitle: "From ₹169",
        cta: "Shop Now",
        href: "/category/lipstick",
        bg: "from-blue-50 to-pink-50",
        emoji: "💄",
        accent: "bg-blue-400",
    },
    {
        title: "Body Lotion",
        subtitle: "From ₹399",
        cta: "Shop Now",
        href: "/category/body-care",
        bg: "from-green-50 to-pink-50",
        emoji: "🧴",
        accent: "bg-green-400",
    },
];

export function PromoCards() {
    return (
        <section className="max-w-7xl mx-auto px-4 py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {promos.map((promo, i) => (
                    <Link
                        key={i}
                        href={promo.href}
                        className={`rounded-2xl bg-gradient-to-br ${promo.bg} p-6 flex items-center gap-4 group hover:shadow-lg hover:shadow-pink-500/10 transition-all duration-300 hover:-translate-y-1`}
                    >
                        <div className="text-5xl">{promo.emoji}</div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg mb-0.5">{promo.title}</h3>
                            <p className="text-gray-500 text-sm mb-3">{promo.subtitle}</p>
                            <span className={`inline-block ${promo.accent} text-white text-xs px-4 py-1.5 rounded-full font-medium group-hover:shadow-md transition-shadow`}>
                                {promo.cta}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
