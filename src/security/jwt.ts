

import jwt, { SignOptions } from 'jsonwebtoken';
import { Err, Ok, Result } from '../helper-func/result';

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
    verifyToken<T>(token: string): Result<T, Exception> {
        try {
            return new Ok(jwt.verify(token, this.secret) as T);
        } catch (error: any) {
            const mesg = 'Token verification failed:' + error.message
            console.error(mesg);

            return new Err(new UnauthorizedException("Token Failed"))

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

      /**
     * Sign the verification code with HMAC for integrity and authenticity
     * @param code - The verification code to sign
     * @returns The signed hash of the code
     */
      signCode(code: string): string {
        const hmac = crypto.createHmac('sha256', this.secret);
        hmac.update(code);
        return hmac.digest('hex');
    }
}


