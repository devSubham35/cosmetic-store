import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// 👇 ADD THIS HERE
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ SMTP error:", error);
  } else {
    console.log("✅ SMTP server is ready");
  }
});

export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
    try {
        await transporter.sendMail({
            from: `"Cosmetic Store" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Your login OTP - ${otp}`,
            html: `
<div style="font-family:'Inter',sans-serif;max-width:480px;margin:0 auto;background:#fff5f9;padding:32px;border-radius:12px;">
  <div style="text-align:center;padding-bottom:20px;border-bottom:2px solid #ff4d8d;">
    <h1 style="color:#ff4d8d;margin:0;font-size:22px;">&#128132; CosmeticStore</h1>
  </div>
  <div style="padding:28px 0;text-align:center;">
    <p style="color:#374151;font-size:16px;margin:0 0 20px;">Your one-time login code is:</p>
    <div style="display:inline-block;background:#ff4d8d;color:white;font-size:36px;font-weight:700;letter-spacing:12px;padding:16px 32px;border-radius:12px;">
      ${otp}
    </div>
    <p style="color:#6b7280;font-size:13px;margin:20px 0 0;">This code expires in 10 minutes. Do not share it with anyone.</p>
  </div>
</div>`,
        });
        return true;
    } catch (error) {
        console.error("OTP email error:", error);
        return false;
    }
}

interface OrderProduct {
    name: string;
    quantity: number;
    price: number;
}

interface CustomerDetails {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    notes?: string;
}

export async function sendOrderEmail(
    orderId: string,
    products: OrderProduct[],
    total: number,
    customer: CustomerDetails
) {
    const productRows = products
        .map(
            (p, i) =>
                `<tr>
          <td style="padding:8px;border-bottom:1px solid #fccce0;">${i + 1}</td>
          <td style="padding:8px;border-bottom:1px solid #fccce0;">${p.name}</td>
          <td style="padding:8px;border-bottom:1px solid #fccce0;text-align:center;">${p.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #fccce0;text-align:right;">₹${p.price.toFixed(2)}</td>
          <td style="padding:8px;border-bottom:1px solid #fccce0;text-align:right;">₹${(p.price * p.quantity).toFixed(2)}</td>
        </tr>`
        )
        .join("");

    const html = `
    <div style="font-family:'Inter',sans-serif;max-width:600px;margin:0 auto;background:#fff5f9;padding:24px;border-radius:12px;">
      <div style="text-align:center;padding:16px 0;border-bottom:2px solid #ff4d8d;">
        <h1 style="color:#ff4d8d;margin:0;font-size:24px;">💄 New Order Received!</h1>
        <p style="color:#6b7280;margin:4px 0 0;">Order #${orderId}</p>
      </div>
      
      <div style="margin:20px 0;padding:16px;background:white;border-radius:8px;">
        <h3 style="color:#1a1a2e;margin:0 0 12px;">Customer Details</h3>
        <p style="margin:4px 0;"><strong>Name:</strong> ${customer.fullName}</p>
        <p style="margin:4px 0;"><strong>Phone:</strong> ${customer.phone}</p>
        <p style="margin:4px 0;"><strong>Email:</strong> ${customer.email}</p>
        <p style="margin:4px 0;"><strong>Address:</strong> ${customer.address}, ${customer.city}, ${customer.state} - ${customer.pincode}</p>
        ${customer.notes ? `<p style="margin:4px 0;"><strong>Notes:</strong> ${customer.notes}</p>` : ""}
      </div>
      
      <div style="margin:20px 0;padding:16px;background:white;border-radius:8px;">
        <h3 style="color:#1a1a2e;margin:0 0 12px;">Order Items</h3>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#fde6ef;">
              <th style="padding:8px;text-align:left;">#</th>
              <th style="padding:8px;text-align:left;">Product</th>
              <th style="padding:8px;text-align:center;">Qty</th>
              <th style="padding:8px;text-align:right;">Price</th>
              <th style="padding:8px;text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
        </table>
      </div>
      
      <div style="text-align:right;padding:16px;background:#ff4d8d;color:white;border-radius:8px;font-size:20px;">
        <strong>Total: ₹${total.toFixed(2)}</strong>
      </div>
    </div>
  `;

    try {
        await transporter.sendMail({
            from: `"Cosmetic Store" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject: `New Order #${orderId} - ₹${total.toFixed(2)}`,
            html,
        });
        return true;
    } catch (error) {
        console.error("Email send error:", error);
        return false;
    }
}

export async function sendOrderConfirmationToCustomer(
    customerEmail: string,
    orderId: string,
    products: OrderProduct[],
    total: number,
    customer: CustomerDetails
): Promise<boolean> {
    const productRows = products
        .map(
            (p, i) =>
                `<tr>
          <td style="padding:8px;border-bottom:1px solid #fccce0;">${i + 1}</td>
          <td style="padding:8px;border-bottom:1px solid #fccce0;">${p.name}</td>
          <td style="padding:8px;border-bottom:1px solid #fccce0;text-align:center;">${p.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #fccce0;text-align:right;">&#8377;${p.price.toFixed(2)}</td>
          <td style="padding:8px;border-bottom:1px solid #fccce0;text-align:right;">&#8377;${(p.price * p.quantity).toFixed(2)}</td>
        </tr>`
        )
        .join("");

    const html = `
<div style="font-family:'Inter',sans-serif;max-width:600px;margin:0 auto;background:#fff5f9;padding:24px;border-radius:12px;">
  <div style="text-align:center;padding:16px 0;border-bottom:2px solid #ff4d8d;">
    <h1 style="color:#ff4d8d;margin:0;font-size:24px;">&#128132; Order Confirmed!</h1>
    <p style="color:#6b7280;margin:4px 0 0;">Hi ${customer.fullName}, your order has been placed successfully.</p>
  </div>

  <div style="margin:20px 0;padding:16px;background:white;border-radius:8px;">
    <p style="margin:0 0 8px;color:#374151;"><strong>Order ID:</strong> <span style="font-family:monospace;">#${orderId.slice(-8).toUpperCase()}</span></p>
    <p style="margin:4px 0;color:#374151;"><strong>Delivery to:</strong> ${customer.address}, ${customer.city}, ${customer.state} - ${customer.pincode}</p>
    ${customer.notes ? `<p style="margin:4px 0;color:#374151;"><strong>Notes:</strong> ${customer.notes}</p>` : ""}
  </div>

  <div style="margin:20px 0;padding:16px;background:white;border-radius:8px;">
    <h3 style="color:#1a1a2e;margin:0 0 12px;">Your Items</h3>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="background:#fde6ef;">
          <th style="padding:8px;text-align:left;">#</th>
          <th style="padding:8px;text-align:left;">Product</th>
          <th style="padding:8px;text-align:center;">Qty</th>
          <th style="padding:8px;text-align:right;">Price</th>
          <th style="padding:8px;text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>${productRows}</tbody>
    </table>
  </div>

  <div style="text-align:right;padding:16px;background:#ff4d8d;color:white;border-radius:8px;font-size:20px;">
    <strong>Total: &#8377;${total.toFixed(2)}</strong>
  </div>

  <p style="text-align:center;color:#9ca3af;font-size:13px;margin-top:20px;">
    We will notify you when your order is shipped. Thank you for shopping with CosmeticStore!
  </p>
</div>`;

    try {
        await transporter.sendMail({
            from: `"Cosmetic Store" <${process.env.EMAIL_USER}>`,
            to: customerEmail,
            subject: `Order Confirmed #${orderId.slice(-8).toUpperCase()} - CosmeticStore`,
            html,
        });
        return true;
    } catch (error) {
        console.error("Order confirmation email error:", error);
        return false;
    }
}

const STATUS_MESSAGES: Record<string, { headline: string; body: string; color: string }> = {
    Confirmed: {
        headline: "Your order has been confirmed!",
        body: "Great news! We have confirmed your order and it is being prepared.",
        color: "#3b82f6",
    },
    Shipped: {
        headline: "Your order is on its way!",
        body: "Your order has been shipped and is on its way to you. You will receive it soon.",
        color: "#a855f7",
    },
    Delivered: {
        headline: "Your order has been delivered!",
        body: "Your order has been delivered. We hope you love your purchase!",
        color: "#22c55e",
    },
    Pending: {
        headline: "Your order is pending",
        body: "Your order is currently pending. We will update you shortly.",
        color: "#eab308",
    },
};

export async function sendStatusUpdateEmail(
    customerEmail: string,
    orderId: string,
    newStatus: string,
    customerName: string
): Promise<boolean> {
    const msg = STATUS_MESSAGES[newStatus] ?? {
        headline: `Order status: ${newStatus}`,
        body: `Your order status has been updated to ${newStatus}.`,
        color: "#ff4d8d",
    };

    const html = `
<div style="font-family:'Inter',sans-serif;max-width:500px;margin:0 auto;background:#fff5f9;padding:32px;border-radius:12px;">
  <div style="text-align:center;padding-bottom:20px;border-bottom:2px solid #ff4d8d;">
    <h1 style="color:#ff4d8d;margin:0;font-size:22px;">&#128132; CosmeticStore</h1>
  </div>
  <div style="padding:28px 0;text-align:center;">
    <div style="display:inline-block;background:${msg.color};color:white;font-size:14px;font-weight:700;letter-spacing:1px;padding:8px 20px;border-radius:999px;margin-bottom:20px;">
      ${newStatus.toUpperCase()}
    </div>
    <h2 style="color:#1f2937;font-size:20px;margin:0 0 12px;">${msg.headline}</h2>
    <p style="color:#6b7280;font-size:15px;margin:0 0 20px;">Hi ${customerName}, ${msg.body}</p>
    <p style="color:#9ca3af;font-size:13px;font-family:monospace;">Order ID: #${orderId.slice(-8).toUpperCase()}</p>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:12px;border-top:1px solid #fce7f3;padding-top:16px;margin:0;">
    Thank you for shopping with CosmeticStore!
  </p>
</div>`;

    try {
        await transporter.sendMail({
            from: `"Cosmetic Store" <${process.env.EMAIL_USER}>`,
            to: customerEmail,
            subject: `Order #${orderId.slice(-8).toUpperCase()} - ${newStatus} | CosmeticStore`,
            html,
        });
        return true;
    } catch (error) {
        console.error("Status update email error:", error);
        return false;
    }
}

export function generateWhatsAppURL(
    products: OrderProduct[],
    total: number,
    customer: CustomerDetails
) {
    const productList = products
        .map((p, i) => `${i + 1}. ${p.name} - Qty ${p.quantity} - ₹${p.price.toFixed(2)}`)
        .join("\n");

    const message = `🛍️ *New Order Received*

*Customer Details:*
Name: ${customer.fullName}
Phone: ${customer.phone}
Email: ${customer.email}
Address: ${customer.address}, ${customer.city}, ${customer.state} - ${customer.pincode}
${customer.notes ? `Notes: ${customer.notes}` : ""}

*Products:*
${productList}

*Total: ₹${total.toFixed(2)}*`;

    const encoded = encodeURIComponent(message);
    return `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encoded}`;
}
