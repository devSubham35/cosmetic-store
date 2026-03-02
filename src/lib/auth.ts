import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "fallback-secret-change-in-production"
);

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
}

export async function signJWT(payload: JWTPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as JWTPayload;
    } catch {
        return null;
    }
}
