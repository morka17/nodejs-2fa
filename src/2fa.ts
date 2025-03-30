import { authenticator } from 'otplib';
import { Result, Ok, Err } from './helper-func/result';
import { Exception } from './exceptions/exception';
import { emailWorkerQueue } from './configs/redis.config';
import { PrismaClient } from '@prisma/client';

// Enum for supported 2FA methods
export enum TwoFactorMethod {
    EMAIL = 'email',
    SMS = 'sms',
    AUTHENTICATOR = 'authenticator',
}

// Interface for 2FA options
export interface TwoFactorAuthOptions {
    userId: string;
    method: TwoFactorMethod;
    secret?: string;
    email?: string;
    phoneNumber?: string;
}

// Interface for verification result
interface VerificationResult {
    isValid: boolean;
    remainingAttempts: number;
}

// 2FA Service class
export class TwoFactorAuthService {
    private prisma: PrismaClient;
    private readonly MAX_ATTEMPTS = 3;
    private readonly CODE_EXPIRY = 5 * 60; // 5 minutes in seconds

    constructor(private options: TwoFactorAuthOptions) {
        this.prisma = new PrismaClient();
    }

    // Generate a secret for TOTP
    generateSecret(): Result<string, Exception> {
        try {
            if (this.options.method !== TwoFactorMethod.AUTHENTICATOR) {
                return new Err(new Exception('Secret generation is only for authenticator-based 2FA', 400));
            }
            const secret = authenticator.generateSecret();
            this.options.secret = secret;
            return new Ok(secret);
        } catch (error) {
            return new Err(new Exception('Failed to generate TOTP secret', 500));
        }
    }

    // Generate a verification code
    private generateVerificationCode(): string {
        return authenticator.generateTOTP(this.options.secret || '');
    }

    // Send an email for email-based 2FA
    async sendEmailCode(): Promise<Result<boolean, Exception>> {
        try {
            if (this.options.method !== TwoFactorMethod.EMAIL || !this.options.email) {
                return new Err(new Exception('Invalid email-based 2FA configuration', 400));
            }

            const code = this.generateVerificationCode();
            const expiry = new Date(Date.now() + this.CODE_EXPIRY * 1000);

            // Store the code in the database
            await this.prisma.twoFA.update({
                where: { userId: parseInt(this.options.userId) },
                data: {
                    secret: code,
                    method: TwoFactorMethod.EMAIL,
                    createdAt: new Date(),
                },
            });

            // Queue email sending
            await emailWorkerQueue.add('send-2fa-email', {
                email: this.options.email,
                code,
                expiry,
            });

            return new Ok(true);
        } catch (error) {
            return new Err(new Exception('Failed to send email code', 500));
        }
    }

    // Send an SMS for SMS-based 2FA
    async sendSmsCode(): Promise<Result<boolean, Exception>> {
        try {
            if (this.options.method !== TwoFactorMethod.SMS || !this.options.phoneNumber) {
                return new Err(new Exception('Invalid SMS-based 2FA configuration', 400));
            }

            const code = this.generateVerificationCode();
            const expiry = new Date(Date.now() + this.CODE_EXPIRY * 1000);

            // Store the code in the database
            await this.prisma.twoFA.update({
                where: { userId: parseInt(this.options.userId) },
                data: {
                    secret: code,
                    method: TwoFactorMethod.SMS,
                    createdAt: new Date(),
                },
            });

            // TODO: Implement SMS sending logic
            console.log(`SMS sent to ${this.options.phoneNumber} with code: ${code}`);

            return new Ok(true);
        } catch (error) {
            return new Err(new Exception('Failed to send SMS code', 500));
        }
    }

    // Verify a given code
    async verifyCode(inputCode: string): Promise<Result<VerificationResult, Exception>> {
        try {
            const stored2FA = await this.prisma.twoFA.findUnique({
                where: { userId: parseInt(this.options.userId) },
            });

            if (!stored2FA) {
                return new Err(new Exception('2FA not configured for this user', 400));
            }

            // Check if code has expired
            const codeAge = Date.now() - stored2FA.createdAt.getTime();
            if (codeAge > this.CODE_EXPIRY * 1000) {
                return new Err(new Exception('Verification code has expired', 400));
            }

            let isValid = false;
            switch (this.options.method) {
                case TwoFactorMethod.AUTHENTICATOR:
                    isValid = authenticator.verify({
                        token: inputCode,
                        secret: stored2FA.secret,
                    });
                    break;
                case TwoFactorMethod.EMAIL:
                case TwoFactorMethod.SMS:
                    isValid = inputCode === stored2FA.secret;
                    break;
            }

            // Update remaining attempts
            const remainingAttempts = this.MAX_ATTEMPTS - 1;

            return new Ok({
                isValid,
                remainingAttempts,
            });
        } catch (error) {
            return new Err(new Exception('Failed to verify code', 500));
        }
    }

    // Disable 2FA for a user
    async disable2FA(): Promise<Result<boolean, Exception>> {
        try {
            await this.prisma.twoFA.delete({
                where: { userId: parseInt(this.options.userId) },
            });

            await this.prisma.user.update({
                where: { id: parseInt(this.options.userId) },
                data: { is2FAEnabled: false },
            });

            return new Ok(true);
        } catch (error) {
            return new Err(new Exception('Failed to disable 2FA', 500));
        }
    }
}
  