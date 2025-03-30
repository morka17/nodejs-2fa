import { TwoFactorAuthService, TwoFactorMethod } from '../2fa';
import { prisma } from './setup';
import { Result } from '../helper-func/result';

describe('TwoFactorAuthService', () => {
  let twoFactorAuth: TwoFactorAuthService;

  beforeEach(() => {
    twoFactorAuth = new TwoFactorAuthService({
      userId: '1',
      method: TwoFactorMethod.EMAIL,
      email: 'test@example.com',
    });
  });

  describe('generateSecret', () => {
    it('should generate a valid TOTP secret', async () => {
      const result = twoFactorAuth.generateSecret();
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBeDefined();
        expect(result.value.length).toBeGreaterThan(0);
      }
    });

    it('should fail for non-authenticator methods', async () => {
      const smsAuth = new TwoFactorAuthService({
        userId: '1',
        method: TwoFactorMethod.SMS,
        phoneNumber: '+1234567890',
      });
      const result = smsAuth.generateSecret();
      expect(result.isErr()).toBe(true);
    });
  });

  describe('sendEmailCode', () => {
    it('should send an email code successfully', async () => {
      const result = await twoFactorAuth.sendEmailCode();
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe(true);
      }
    });

    it('should fail for invalid email configuration', async () => {
      const invalidAuth = new TwoFactorAuthService({
        userId: '1',
        method: TwoFactorMethod.EMAIL,
      });
      const result = await invalidAuth.sendEmailCode();
      expect(result.isErr()).toBe(true);
    });
  });

  describe('sendSmsCode', () => {
    it('should send an SMS code successfully', async () => {
      const smsAuth = new TwoFactorAuthService({
        userId: '1',
        method: TwoFactorMethod.SMS,
        phoneNumber: '+1234567890',
      });
      const result = await smsAuth.sendSmsCode();
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe(true);
      }
    });

    it('should fail for invalid SMS configuration', async () => {
      const invalidAuth = new TwoFactorAuthService({
        userId: '1',
        method: TwoFactorMethod.SMS,
      });
      const result = await invalidAuth.sendSmsCode();
      expect(result.isErr()).toBe(true);
    });
  });

  describe('verifyCode', () => {
    it('should verify a valid code', async () => {
      // First send a code
      await twoFactorAuth.sendEmailCode();

      // Then verify it
      const result = await twoFactorAuth.verifyCode('123456');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.isValid).toBe(true);
        expect(result.value.remainingAttempts).toBeDefined();
      }
    });

    it('should reject an invalid code', async () => {
      const result = await twoFactorAuth.verifyCode('invalid');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.isValid).toBe(false);
      }
    });

    it('should handle expired codes', async () => {
      // Set code expiry to 0 for testing
      (twoFactorAuth as any).CODE_EXPIRY = 0;
      
      // Send a code
      await twoFactorAuth.sendEmailCode();

      // Wait for code to expire
      await new Promise(resolve => setTimeout(resolve, 100));

      // Try to verify
      const result = await twoFactorAuth.verifyCode('123456');
      expect(result.isErr()).toBe(true);
    });
  });

  describe('disable2FA', () => {
    it('should disable 2FA successfully', async () => {
      // First enable 2FA
      await prisma.user.update({
        where: { id: 1 },
        data: { is2FAEnabled: true },
      });

      const result = await twoFactorAuth.disable2FA();
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe(true);
      }

      // Verify 2FA is disabled
      const user = await prisma.user.findUnique({
        where: { id: 1 },
      });
      expect(user?.is2FAEnabled).toBe(false);
    });
  });
}); 