import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/product.model";
import { Category } from "@/models/category.model";
import { Order } from "@/models/order.model";
import { User } from "@/models/user.model";
import { sampleProducts, sampleCategories } from "@/lib/data";

// ─── Helpers ────────────────────────────────────────────────────────────────

function randomBetween(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(year: number, month: number) {
    const day = randomBetween(1, 28);
    const hour = randomBetween(8, 22);
    const minute = randomBetween(0, 59);
    return new Date(year, month, day, hour, minute);
}

function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Seed Data ──────────────────────────────────────────────────────────────

const INDIAN_NAMES = [
    "Priya Sharma", "Anita Kumari", "Sneha Patel", "Riya Gupta", "Meera Reddy",
    "Kavita Joshi", "Pooja Verma", "Deepa Thakur", "Nisha Agarwal", "Swati Singh",
    "Anjali Mishra", "Sunita Rao", "Divya Nair", "Rekha Mehta", "Neha Kapoor",
    "Suman Das", "Aarti Chopra", "Lakshmi Pillai", "Geeta Saxena", "Rashmi Iyer",
    "Bhavna Tiwari", "Manisha Yadav", "Komal Chauhan", "Jyoti Pandey", "Pallavi Deshmukh",
    "Seema Malhotra", "Vineeta Arora", "Sapna Bhatt", "Tara Kulkarni", "Rohini Shenoy",
    "Alka Dubey", "Mona Banerjee", "Shilpa Rawat", "Ritika Bose", "Kamini Jain",
    "Vandana Goyal", "Poonam Sethi", "Nandini Menon", "Shalini Choudhary", "Usha Krishnan",
];

const CITIES_STATES: { city: string; state: string; pincode: string }[] = [
    { city: "Mumbai", state: "Maharashtra", pincode: "400001" },
    { city: "Pune", state: "Maharashtra", pincode: "411001" },
    { city: "Delhi", state: "Delhi", pincode: "110001" },
    { city: "Noida", state: "Uttar Pradesh", pincode: "201301" },
    { city: "Lucknow", state: "Uttar Pradesh", pincode: "226001" },
    { city: "Bangalore", state: "Karnataka", pincode: "560001" },
    { city: "Mysore", state: "Karnataka", pincode: "570001" },
    { city: "Chennai", state: "Tamil Nadu", pincode: "600001" },
    { city: "Coimbatore", state: "Tamil Nadu", pincode: "641001" },
    { city: "Hyderabad", state: "Telangana", pincode: "500001" },
    { city: "Kolkata", state: "West Bengal", pincode: "700001" },
    { city: "Jaipur", state: "Rajasthan", pincode: "302001" },
    { city: "Ahmedabad", state: "Gujarat", pincode: "380001" },
    { city: "Surat", state: "Gujarat", pincode: "395001" },
    { city: "Chandigarh", state: "Punjab", pincode: "160001" },
    { city: "Indore", state: "Madhya Pradesh", pincode: "452001" },
    { city: "Bhopal", state: "Madhya Pradesh", pincode: "462001" },
    { city: "Kochi", state: "Kerala", pincode: "682001" },
    { city: "Patna", state: "Bihar", pincode: "800001" },
    { city: "Guwahati", state: "Assam", pincode: "781001" },
];

const ADDRESSES = [
    "12, Rose Garden Society", "45/A, MG Road", "78, Shanti Nagar",
    "Block C, Sector 15", "203, Lakshmi Towers", "9, Nehru Colony",
    "Plot 34, Industrial Area", "Flat 501, Green Valley Apartments",
    "18/B, Gandhi Chowk", "67, Rajendra Nagar", "23, Patel Street",
    "89/2, Model Town", "11, Civil Lines", "56, Ashok Vihar",
    "44, Jubilee Hills", "7, Koramangala 4th Block", "32, Anna Nagar",
    "15/C, Salt Lake City", "91, Vaishali Nagar", "28, Aundh Road",
];

export async function POST() {
    try {
        await connectDB();

        // ── Clear all collections ──
        await Promise.all([
            Product.deleteMany({}),
            Category.deleteMany({}),
            Order.deleteMany({}),
            User.deleteMany({}),
        ]);

        // ── Seed Categories ──
        const categories = await Category.insertMany(
            sampleCategories.map((c, i) => ({
                ...c,
                isActive: true,
                createdAt: new Date(2025, 0, 1 + i * 5),
            }))
        );

        // ── Seed Products ──
        const products = await Product.insertMany(sampleProducts);

        // ── Seed Users (spread across 2024 & 2025) ──
        const usersToInsert = [];

        // Admin user
        usersToInsert.push({
            email: "cosmeticstore@yopmail.com",
            name: "Admin",
            role: "admin",
            createdAt: new Date(2024, 0, 1),
        });

        // Spread users across months for good chart data
        // 2024: ~3-8 users per month
        for (let month = 0; month < 12; month++) {
            const count = randomBetween(3, 8);
            for (let j = 0; j < count; j++) {
                const name = pickRandom(INDIAN_NAMES);
                const emailName = name.toLowerCase().replace(/\s+/g, ".") + randomBetween(1, 999);
                usersToInsert.push({
                    email: `${emailName}@gmail.com`,
                    name,
                    role: "user",
                    createdAt: randomDate(2024, month),
                });
            }
        }

        // 2025: ~5-15 users per month (growing)
        for (let month = 0; month < 12; month++) {
            const count = randomBetween(5, 12 + month);
            for (let j = 0; j < count; j++) {
                const name = pickRandom(INDIAN_NAMES);
                const emailName = name.toLowerCase().replace(/\s+/g, ".") + randomBetween(1000, 9999);
                usersToInsert.push({
                    email: `${emailName}@gmail.com`,
                    name,
                    role: "user",
                    createdAt: randomDate(2025, month),
                });
            }
        }

        // 2026: Jan-Feb
        for (let month = 0; month < 2; month++) {
            const count = randomBetween(8, 18);
            for (let j = 0; j < count; j++) {
                const name = pickRandom(INDIAN_NAMES);
                const emailName = name.toLowerCase().replace(/\s+/g, ".") + randomBetween(10000, 99999);
                usersToInsert.push({
                    email: `${emailName}@gmail.com`,
                    name,
                    role: "user",
                    createdAt: randomDate(2026, month),
                });
            }
        }

        const users = await User.insertMany(usersToInsert);

        // ── Seed Orders (spread across 2024 & 2025 & early 2026) ──
        const allProducts = await Product.find().lean();
        const ordersToInsert = [];

        function generateOrder(date: Date) {
            const numProducts = randomBetween(1, 3);
            const orderProducts = [];
            let totalAmount = 0;

            for (let p = 0; p < numProducts; p++) {
                const product = pickRandom(allProducts);
                const quantity = randomBetween(1, 3);
                const price = product.discountPrice ?? product.price;
                totalAmount += price * quantity;
                orderProducts.push({
                    productId: product._id.toString(),
                    name: product.name,
                    price,
                    quantity,
                    image: product.images[0] || "",
                });
            }

            const loc = pickRandom(CITIES_STATES);
            const name = pickRandom(INDIAN_NAMES);
            const emailName = name.toLowerCase().replace(/\s+/g, ".") + randomBetween(1, 999);
            const statuses: ("Pending" | "Confirmed" | "Shipped" | "Delivered")[] = ["Pending", "Confirmed", "Shipped", "Delivered"];
            const paymentStatuses: ("Paid" | "Pending")[] = ["Paid", "Paid", "Paid", "Pending"]; // mostly paid

            return {
                products: orderProducts,
                totalAmount,
                customerDetails: {
                    fullName: name,
                    phone: `98${randomBetween(10000000, 99999999)}`,
                    email: `${emailName}@gmail.com`,
                    address: pickRandom(ADDRESSES),
                    city: loc.city,
                    state: loc.state,
                    pincode: loc.pincode,
                },
                status: pickRandom(statuses),
                paymentStatus: pickRandom(paymentStatuses),
                paymentId: `pay_${Date.now()}_${randomBetween(1000, 9999)}`,
                createdAt: date,
            };
        }

        // 2024 orders: 2-5 per month (building up)
        for (let month = 0; month < 12; month++) {
            const count = randomBetween(2, 5 + Math.floor(month / 2));
            for (let j = 0; j < count; j++) {
                ordersToInsert.push(generateOrder(randomDate(2024, month)));
            }
        }

        // 2025 orders: 5-20 per month (growing business)
        for (let month = 0; month < 12; month++) {
            const count = randomBetween(5, 12 + month);
            for (let j = 0; j < count; j++) {
                ordersToInsert.push(generateOrder(randomDate(2025, month)));
            }
        }

        // 2026 Jan-Feb: 10-25 per month
        for (let month = 0; month < 2; month++) {
            const count = randomBetween(10, 25);
            for (let j = 0; j < count; j++) {
                ordersToInsert.push(generateOrder(randomDate(2026, month)));
            }
        }

        const orders = await Order.insertMany(ordersToInsert);

        return NextResponse.json({
            message: "Database seeded successfully!",
            categories: categories.length,
            products: products.length,
            users: users.length,
            orders: orders.length,
        });
    } catch (error) {
        console.error("Seed error:", error);
        return NextResponse.json(
            { error: "Failed to seed database", details: String(error) },
            { status: 500 }
        );
    }
}
