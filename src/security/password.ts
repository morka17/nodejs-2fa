import bcrypt from 'bcryptjs';
import { Result, Ok, Err } from '../helper-func/result';
import { Exception } from '../exceptions/exception';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<Result<string, Exception>> {
    try {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hash = await bcrypt.hash(password, salt);
        return new Ok(hash);
    } catch (error) {
        return new Err(new Exception('Password hashing failed', 500));
    }
}

export async function verifyPassword(inputPassword: string, storedHash: string): Promise<Result<boolean, Exception>> {
    try {
        const isValid = await bcrypt.compare(inputPassword, storedHash);
        return new Ok(isValid);
    } catch (error) {
        return new Err(new Exception('Password verification failed', 500));
    }
}

export function generatePasswordResetToken(): string {
    return bcrypt.genSaltSync(32);
}

export function validatePasswordStrength(password: string): Result<boolean, Exception> {
    // Password must be at least 8 characters long
    if (password.length < 8) {
        return new Err(new Exception('Password must be at least 8 characters long', 400));
    }

    // Password must contain at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        return new Err(new Exception('Password must contain at least one uppercase letter', 400));
    }

    // Password must contain at least one lowercase letter
    if (!/[a-z]/.test(password)) {
        return new Err(new Exception('Password must contain at least one lowercase letter', 400));
    }

    // Password must contain at least one number
    if (!/[0-9]/.test(password)) {
        return new Err(new Exception('Password must contain at least one number', 400));
    }

    // Password must contain at least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return new Err(new Exception('Password must contain at least one special character', 400));
    }

    return new Ok(true);
}