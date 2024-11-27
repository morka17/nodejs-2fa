import { TwoFactorAuthOptions } from "./2fa";
import { Result } from "./helper-func/result";




/**
 * Interface for FlareAuth: A modular authentication library that supports 
 * email, phone, and third-party providers with optional 2FA security.
 */
interface FlareAuth {
    /**
     * Create a new user in the system.
     * @param user - The user object containing user details.
     * @returns A Result containing the created user or an Exception.
     */
    CreateNewUser<T>({ user }: { user: T }): Result<T, Exception>;

    // ---------------------------
    // Signup Methods
    // ---------------------------

    /**
     * Register a user using email and password.
     * @param email - The user's email address.
     * @param password - The user's password.
     * @returns A Result containing the signed-up user or an Exception.
     */
    SignupWithEmailAndPassword<T>({ email, password }: { email: string, password: string }): Result<T, Exception>;

    /**
     * Register a user using phone number and password.
     * @param phone - The user's phone number.
     * @param password - The user's password.
     * @returns A Result containing the signed-up user or an Exception.
     */
    SignupWithPhoneNumberAndPassword<T>({ phone, password }: { phone: string, password: string }): Result<T, Exception>;

    // ---------------------------
    // Login Methods
    // ---------------------------

    /**
     * Authenticate a user using email and password.
     * @param email - The user's email address.
     * @param password - The user's password.
     * @returns A Result containing the authenticated user or an Exception.
     */
    SignInWithEmailAndPassword<T>({ email, password }: { email: string, password: string }): Result<T, Exception>;

    /**
     * Authenticate a user using phone number and password.
     * @param phone - The user's phone number.
     * @param password - The user's password.
     * @returns A Result containing the authenticated user or an Exception.
     */
    SignInWithPhoneNumberAndPassword<T>({ phone, password }: { phone: string, password: string }): Result<T, Exception>;

    // ---------------------------
    // Two-Factor Authentication (2FA) for Login
    // ---------------------------

    /**
     * Begin a multi-factor authentication login process.
     * @param option - Options for the 2FA process, such as email, SMS, or authenticator app.
     * @returns A Result containing the authentication payload or an Exception.
     */
    MultiAuthSignIn<T>(option: TwoFactorAuthOptions): Result<T, Exception>;

    /**
     * Verify the 2FA login token.
     * @param token - The token received via the selected 2FA method.
     * @returns A Result containing the authenticated user or an Exception.
     */
    MultiAuthSignInVerification<T>(token: string): Result<T, Exception>;

    // ---------------------------
    // Authentication Providers
    // ---------------------------

    /**
     * Sign in or sign up with an external authentication provider (e.g., Google, Firebase).
     * @param provider - The selected provider for authentication.
     * @returns A Result containing the authenticated user or an Exception.
     */
    SignWithAuthProvider<T>({ provider }: { provider: Provider }): Result<T, Exception>;

    // ---------------------------
    // Email Verification
    // ---------------------------

    /**
     * Send a verification link to the user's email address.
     * @param uid - The user ID for whom to send the verification link.
     * @returns A Result indicating success or an Exception.
     */
    SendEmailVerificationLink(uid: string): Result<void, Exception>;

    /**
     * Verify the email verification link.
     * @param token - The verification token from the link.
     * @returns A Result indicating success or an Exception.
     */
    VerifyEmailVerificationLink(token: string): Result<void, Exception>;

    // ---------------------------
    // Password Reset
    // ---------------------------

    /**
     * Send a password reset link to the user.
     * @param uid - The user ID for whom to send the reset link.
     * @returns A Result indicating success or an Exception.
     */
    SendPasswordResetLink(uid: string): Result<void, Exception>;

    /**
     * Verify the password reset token and allow the user to set a new password.
     * @param token - The reset token from the email.
     * @returns A Result containing the updated user or an Exception.
     */
    VerifyPasswordResetLink<T>(token: string): Result<T, Exception>;

    /**
     * Set a new password after password reset verification.
     * @param resetToken - The reset token from the verification process.
     * @param setNewPassword - The new password to be set.
     * @returns A Result containing the updated user or an Exception.
     */
    setNewPassword<T>({ resetToken, setNewPassword }: { resetToken: string, setNewPassword: string }): Result<T, Exception>;

    /**
     * Change an existing user's password.
     * @param uid - The user's unique ID.
     * @param oldPassword - The user's current password.
     * @param newPassword - The new password to be set.
     * @returns A Result containing the updated user or an Exception.
     */
    changePassword<T>({ uid, oldPassword, newPassword }: { uid: string, oldPassword: string, newPassword: string }): Result<T, Exception>;
}
