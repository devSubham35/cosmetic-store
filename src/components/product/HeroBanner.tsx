"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const banners = [
    {
        title: "Free Shipping Beauty",
        subtitle: "Shop Top Quality Haircare, Makeup, Skincare, Nailcare & Much More.",
        bg: "from-pink-100 via-pink-50 to-white",
        textColor: "text-gray-800",
        cta: "SHOP NOW",
        href: "/category/skin-care",
        src: "/assets/images/Home_Banner_01.png",
        alt: "Home Banner Card 1"
    },
    {
        title: "Summer Glow Collection",
        subtitle: "Discover our latest arrivals in skincare and makeup for the perfect summer look.",
        bg: "from-pink-200 via-pink-100 to-white",
        textColor: "text-gray-800",
        cta: "EXPLORE NOW",
        href: "/category/lipstick",
        src: "/assets/images/Home_Banner_03.png",
        alt: "Home Banner Card 3"
    },
    {
        title: "Natural Beauty",
        subtitle: "100% organic and cruelty-free products for your daily skincare routine.",
        bg: "from-green-50 via-pink-50 to-white",
        textColor: "text-gray-800",
        cta: "DISCOVER MORE",
        href: "/category/natural",
        src: "/assets/images/Home_Banner_02.png",
        alt: "Home Banner Card 2"
    },
];

export function HeroBanner() {
    return (
        <section className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Main Banner Slider */}
                <div className="lg:col-span-2 rounded-2xl overflow-hidden shadow-lg shadow-pink-500/10">
                    <Swiper
                        modules={[Autoplay, Pagination]}
                        autoplay={{ delay: 5000, disableOnInteraction: false }}
                        pagination={{ clickable: true }}
                        loop
                        className="h-[280px] md:h-[380px]"
                    >
                        {banners.map((banner, i) => (
                            <SwiperSlide key={i}>
                                <div
                                    className={`h-full flex items-center px-8 md:px-12 ${banner.src ? "bg-cover bg-center bg-no-repeat" : `bg-gradient-to-r ${banner.bg}`}`}
                                    style={banner.src ? { backgroundImage: `url(${banner.src})` } : undefined}
                                >
                                    <div className="max-w-md">
                                        <h2 className={`text-3xl md:text-4xl font-bold ${banner.textColor} mb-3`} style={{ fontFamily: "'Outfit', sans-serif" }}>
                                            {banner.title}
                                        </h2>
                                        <p className="text-gray-600 text-sm md:text-base mb-6 leading-relaxed">
                                            {banner.subtitle}
                                        </p>
                                        <Link
                                            href={banner.href}
                                            className="inline-block bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/30 hover:-translate-y-0.5"
                                        >
                                            {banner.cta}
                                        </Link>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                {/* Side Banner */}
                <div className="rounded-2xl overflow-hidden bg-gradient-to-br 
                from-purple-100 via-pink-100 to-pink-200 p-6 md:p-8 flex flex-col justify-center items-center text-center shadow-lg shadow-pink-500/10 min-h-[280px]">
                    <h3 className="text-2xl font-bold text-gray-800 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Beauty & Care
                    </h3>
                    <p className="text-pink-600 font-semibold mb-4 text-lg">From ₹299</p>
                    <div className="text-6xl mb-4">💅</div>
                    <Link
                        href="/category/body-care"
                        className="inline-block bg-white text-gray-800 px-6 py-2.5 rounded-full font-medium text-sm hover:bg-pink-500 hover:text-white transition-all duration-300 shadow-md"
                    >
                        Discover Now
                    </Link>
                </div>
            </div>
        </section>
    );
}
