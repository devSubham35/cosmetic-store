export interface ProductType {
    _id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    price: number;
    discountPrice?: number;
    images: string[];
    category: string;
    stock: number;
    sku: string;
    ratings: number;
    reviews: ReviewType[];
    isFeatured: boolean;
    createdAt: string;
}

export interface ReviewType {
    user: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface CategoryType {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    image: string;
    isActive: boolean;
    productCount?: number;
    createdAt: string;
}

export interface OrderType {
    _id: string;
    products: OrderProductType[];
    totalAmount: number;
    customerDetails: CustomerDetailsType;
    status: "Pending" | "Confirmed" | "Shipped" | "Delivered";
    paymentStatus?: "Pending" | "Paid" | "Failed";
    paymentId?: string;
    razorpayOrderId?: string;
    createdAt: string;
}

export interface OrderProductType {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export interface CustomerDetailsType {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    notes?: string;
}

export interface UserType {
    _id: string;
    phone: string;
    name?: string;
    email?: string;
    avatar?: string;
    role: "user" | "admin";
    createdAt: string;
}

export interface AddressType {
    _id: string;
    userId: string;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
    createdAt: string;
}

export interface PaginatedMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
    meta: PaginatedMeta;
    data: T[];
}
