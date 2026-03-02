import { PopularCategories } from "@/components/product/PopularCategories";
import { BannerCards } from "@/components/product/BannerCards";
import { HeroBanner } from "@/components/product/HeroBanner";
import { PromoCards } from "@/components/product/PromoCards";
import { FeaturedProducts } from "@/components/product/FeaturedProducts";

export default function HomePage() {
    return (
        <>
            <PopularCategories />
            <BannerCards />
            <HeroBanner />
            <PromoCards />
            <FeaturedProducts />
        </>
    );
}
