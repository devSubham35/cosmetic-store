import Image from "next/image";

const banners = [
    { src: "/assets/images/Banner_Card_02.png", alt: "Banner Card 1" },
    { src: "/assets/images/Banner_Card_01.png", alt: "Banner Card 2" },
    { src: "/assets/images/Banner_Card_03.png", alt: "Banner Card 3" },
];

export function BannerCards() {
    return (
        <section className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {banners.map((banner, i) => (
                    <div
                        key={i}
                        className="overflow-hidden group hover:shadow-lg hover:shadow-pink-500/10 transition-all duration-300 hover:-translate-y-1"
                    >
                        <Image
                            src={banner.src}
                            alt={banner.alt}
                            width={600}
                            height={400}
                            className="w-full h-full"
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
