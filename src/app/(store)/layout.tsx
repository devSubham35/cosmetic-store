import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AuthProvider } from "@/components/providers/AuthProvider";

export default function StoreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <AnnouncementBar />
            <Header />
            <CartDrawer />
            <main className="min-h-screen">{children}</main>
            <Footer />
        </AuthProvider>
    );
}
