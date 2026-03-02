import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderProduct {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export interface ICustomerDetails {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    notes?: string;
}

export interface IOrder extends Document {
    products: IOrderProduct[];
    totalAmount: number;
    customerDetails: ICustomerDetails;
    status: "Pending" | "Confirmed" | "Shipped" | "Delivered";
    paymentStatus: "Pending" | "Paid" | "Failed";
    paymentId?: string;
    razorpayOrderId?: string;
    userId?: string;
    createdAt: Date;
}

const OrderProductSchema = new Schema<IOrderProduct>({
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: true },
});

const CustomerDetailsSchema = new Schema<ICustomerDetails>({
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    notes: { type: String },
});

const OrderSchema = new Schema<IOrder>({
    products: [OrderProductSchema],
    totalAmount: { type: Number, required: true },
    customerDetails: { type: CustomerDetailsSchema, required: true },
    status: {
        type: String,
        enum: ["Pending", "Confirmed", "Shipped", "Delivered"],
        default: "Pending",
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Failed"],
        default: "Pending",
    },
    paymentId: { type: String },
    razorpayOrderId: { type: String },
    userId: { type: String },
    createdAt: { type: Date, default: Date.now },
});

if (mongoose.models.Order) {
    delete mongoose.models.Order;
}
export const Order: Model<IOrder> = mongoose.model<IOrder>("Order", OrderSchema);
