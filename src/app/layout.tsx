import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Cosmetic Store - Premium Beauty Products",
  description: "Shop premium cosmetics, skincare, makeup, haircare and beauty products at Cosmetic Store. Free shipping on orders over ₹999.",
  keywords: "cosmetics, beauty, skincare, makeup, lipstick, hair care, face pack, body care",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} antialiased font-sans`}>
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
