// Enum for supported 2FA methods
export enum TwoFactorMethod {
    EMAIL = 'email',
    SMS = 'sms',
    AUTHENTICATOR = 'authenticator',
  }
  
  // Interface for 2FA options
  export interface TwoFactorAuthOptions {
    userId: string; // Unique identifier for the user
    method: TwoFactorMethod; // Selected 2FA method
    secret?: string; // Secret for TOTP (used with authenticator apps)
    email?: string; // Email address (for email-based 2FA)
    phoneNumber?: string; // Phone number (for SMS-based 2FA)
  }
  
  // 2FA Service class
  export class TwoFactorAuthService {
    constructor(private options: TwoFactorAuthOptions) {}
  
    // Generate a secret for TOTP
    generateSecret(): string {
      if (this.options.method !== TwoFactorMethod.AUTHENTICATOR) {
        throw new Error('Secret generation is only for authenticator-based 2FA.');
      }
      const secret = 'GENERATED_SECRET'; // Replace with actual secret generation logic
      this.options.secret = secret;
      return secret;
    }
  
    // Send an email for email-based 2FA
    async sendEmailCode(): Promise<boolean> {
      if (this.options.method !== TwoFactorMethod.EMAIL || !this.options.email) {
        throw new Error('Invalid email-based 2FA configuration.');
      }
      const code = Math.floor(100000 + Math.random() * 900000).toString(); // Random 6-digit code
      console.log(`Email sent to ${this.options.email} with code: ${code}`);
      return true; // Replace with actual email-sending logic
    }
  
    // Send an SMS for SMS-based 2FA
    async sendSmsCode(): Promise<boolean> {
      if (this.options.method !== TwoFactorMethod.SMS || !this.options.phoneNumber) {
        throw new Error('Invalid SMS-based 2FA configuration.');
      }
      const code = Math.floor(100000 + Math.random() * 900000).toString(); // Random 6-digit code
      console.log(`SMS sent to ${this.options.phoneNumber} with code: ${code}`);
      return true; // Replace with actual SMS-sending logic
    }
  
    // Verify a given code
    verifyCode(inputCode: string): boolean {
      const validCode = '123456'; // Replace with actual logic to verify code
      return inputCode === validCode;
    }
  }
  