import { ProductCard } from "@/components/product/ProductCard";
import { ProductType } from "@/lib/types";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/product.model";

export async function FeaturedProducts() {
    await connectDB();
    const productsDoc = await Product.find({ isFeatured: true }).limit(8).lean();

    // Deep-serialize: eliminates ObjectId buffers and Date objects on nested subdocs (e.g. reviews)
    const featured: ProductType[] = JSON.parse(JSON.stringify(productsDoc));

    if (featured.length === 0) return null;

    return (
        <section className="max-w-7xl mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Featured Products
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Handpicked beauty essentials just for you</p>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {featured.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </section>
    );
}
