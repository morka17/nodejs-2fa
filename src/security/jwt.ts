import jwt, { SignOptions } from 'jsonwebtoken';

export class JWTServices {
    private secret: string;

    constructor(secret: string) {
        if (!secret) {
            throw new Error('JWT secret is required');
        }
        this.secret = secret;
    }

    /**
     * Generate an access token with the given payload
     * @param payload - The data to include in the token
     * @param options - Additional options such as expiration
     * @returns Signed JWT string
     */
    generateAccessToken<T extends object>(payload: T, options?: SignOptions): string {
        return jwt.sign(payload, this.secret, { expiresIn: '1h', ...options });
    }

    /**
     * Verify and decode a JWT
     * @param token - The JWT string to verify
     * @returns The decoded payload if the token is valid
     */
    verifyToken<T>(token: string): T | null {
        try {
            return jwt.verify(token, this.secret) as T;
        } catch (error) {
            console.error('Token verification failed:', error);
            return null;
        }
    }

    /**
     * Decode a JWT without verifying its signature
     * @param token - The JWT string to decode
     * @returns The decoded payload or null if decoding fails
     */
    decodeToken<T>(token: string): T | null {
        try {
            return jwt.decode(token) as T;
        } catch (error) {
            console.error('Token decoding failed:', error);
            return null;
        }
    }
}


