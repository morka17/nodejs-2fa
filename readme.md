# FlareAuth - Two-Factor Authentication Library

FlareAuth is a robust TypeScript-based authentication library that provides comprehensive authentication solutions including email/password, phone/password, and two-factor authentication (2FA) support. It's built with security, modularity, and ease of use in mind.

## Features

- **Multiple Authentication Methods**
  - Email/Password authentication
  - Phone/Password authentication
  - Third-party provider authentication
  - Two-Factor Authentication (2FA)

- **Two-Factor Authentication Options**
  - Email-based 2FA
  - SMS-based 2FA
  - Authenticator app support (TOTP)

- **Security Features**
  - Password hashing with salt
  - JWT token-based authentication
  - Email verification
  - Password reset functionality
  - Secure password change mechanism

- **Database Integration**
  - Built with Prisma ORM
  - SQLite support (configurable for other databases)

## Installation

```bash
npm install flare_auth
```

## Prerequisites

- Node.js (v14 or higher)
- Redis (for email queue management)
- SQLite (or your preferred database)

## Environment Variables

Create a `.env` file in your project root with the following variables:

```env
DATABASE_URL="file:./dev.db"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
SMTP_HOST="your-smtp-host"
SMTP_PORT=587
SMTP_USER="your-smtp-username"
SMTP_PASS="your-smtp-password"
```

## Usage

### Basic Authentication

```typescript
import { Auth } from 'flare_auth';

const auth = new Auth();

// Sign up with email and password
const signupResult = await auth.SignupWithEmailAndPassword({
  email: 'user@example.com',
  password: 'securepassword'
});

// Sign in with email and password
const signinResult = await auth.SignInWithEmailAndPassword({
  email: 'user@example.com',
  password: 'securepassword'
});
```

### Two-Factor Authentication

```typescript
// Initialize 2FA
const twoFactorAuth = new TwoFactorAuthService({
  userId: 'user123',
  method: TwoFactorMethod.EMAIL,
  email: 'user@example.com'
});

// Send verification code
await twoFactorAuth.sendEmailCode();

// Verify code
const isValid = twoFactorAuth.verifyCode('123456');
```

### Password Management

```typescript
// Send password reset link
await auth.SendPasswordResetLink('user@example.com');

// Verify reset link and set new password
await auth.setNewPassword({
  resetToken: 'reset-token',
  newPassword: 'new-secure-password'
});

// Change password
await auth.changePassword({
  uid: 123,
  oldPassword: 'current-password',
  newPassword: 'new-password'
});
```

## API Reference

### FlareAuth Interface

#### User Management
- `CreateNewUser<T>({ user }: { user: Prisma.UserCreateInput })`: Create a new user
- `SignupWithEmailAndPassword<T>({ email, password })`: Register with email/password
- `SignupWithPhoneNumberAndPassword<T>({ phone, password })`: Register with phone/password

#### Authentication
- `SignInWithEmailAndPassword<T>({ email, password })`: Sign in with email/password
- `SignInWithPhoneNumberAndPassword<T>({ phone, password })`: Sign in with phone/password
- `SignWithAuthProvider<T>({ provider })`: Sign in with third-party provider

#### Two-Factor Authentication
- `MultiAuthSignIn<T>(option: TwoFactorAuthOptions)`: Start 2FA process
- `MultiAuthSignInVerification<T>(token: string)`: Verify 2FA token

#### Email Verification
- `SendEmailVerificationLink<T>(email: string)`: Send verification email
- `VerifyEmailVerificationLink(token: string)`: Verify email link

#### Password Management
- `SendPasswordResetLink<T>(email: string)`: Send password reset email
- `VerifyPasswordResetLink<T>(token: string)`: Verify reset link
- `setNewPassword<T>({ resetToken, newPassword })`: Set new password after reset
- `changePassword<T>({ uid, oldPassword, newPassword })`: Change existing password

### TwoFactorAuthService

- `generateSecret()`: Generate TOTP secret for authenticator apps
- `sendEmailCode()`: Send email verification code
- `sendSmsCode()`: Send SMS verification code
- `verifyCode(inputCode: string)`: Verify input code

## Error Handling

The library uses a Result type for error handling:

```typescript
type Result<T, E> = Ok<T> | Err<E>;
```

All methods return a Promise<Result<T, Exception>> where:
- T is the success type
- Exception contains error details

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Security Considerations

1. All passwords are hashed with salt before storage
2. JWT tokens are used for session management
3. Email verification is required for new accounts
4. Password reset tokens are time-limited
5. 2FA provides an additional layer of security

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.