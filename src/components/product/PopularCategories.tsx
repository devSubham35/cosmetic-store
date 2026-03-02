"use client";

import Link from "next/link";
import Image from "next/image";
import { useCategories } from "@/lib/use-categories";

export function PopularCategories() {
    const categories = useCategories();

    return (
        <section className="max-w-7xl mx-auto px-4 py-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Popular Categories
            </h2>
            <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {categories.map((cat, i) => (
                    <Link
                        key={cat.slug}
                        href={`/category/${cat.slug}`}
                        className="flex flex-col items-center gap-3 shrink-0 group"
                        style={{ animationDelay: `${i * 80}ms` }}
                    >
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-3 border-pink-200 group-hover:border-pink-500 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-pink-500/20 group-hover:scale-110 bg-pink-50">
                            <Image
                                src={cat.image}
                                alt={cat.name}
                                width={96}
                                height={96}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-xs md:text-sm font-medium text-gray-600 group-hover:text-pink-500 transition-colors text-center whitespace-nowrap">
                            {cat.name}
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
}
