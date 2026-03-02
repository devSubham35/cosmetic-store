interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    order_id: string;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
        method?: string;
        vpa?: string;
    };
    config?: {
        display: {
            blocks: Record<string, {
                name: string;
                instruments: { method: string; flows?: string[]; apps?: string[] }[];
            }>;
            sequence: string[];
            preferences: { show_default_blocks: boolean };
        };
    };
    theme?: {
        color?: string;
    };
    handler: (response: RazorpayResponse) => void;
    modal?: {
        ondismiss?: () => void;
    };
}

interface RazorpayResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

interface RazorpayInstance {
    open(): void;
    close(): void;
    on(event: string, callback: () => void): void;
}

interface RazorpayConstructor {
    new (options: RazorpayOptions): RazorpayInstance;
}

interface Window {
    Razorpay: RazorpayConstructor;
}
