import { TwoFactorAuthOptions } from "./2fa";
import { None, Option, Some } from "./helper-func/option";
import { err, Err, Ok, ok, Result } from "./helper-func/result";
import { PrismaClient, Prisma, User } from "@prisma/client"
import { hashPasswordWithSalt, verifyPassword } from "./security/password";
import { injector } from "./locator/injector";



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
    CreateNewUser<T>({ user }: { user: Prisma.UserCreateInput }): Promise<Result<T, Exception>>;

    // ---------------------------
    // Signup Methods
    // ---------------------------

    /**
     * Register a user using email and password.
     * @param email - The user's email address.
     * @param password - The user's password.
     * @returns A Result containing the signed-up user or an Exception.
     */
    SignupWithEmailAndPassword<T>({ email, password }: { email: string, password: string }): Promise<Result<T, Exception>>;

    /**
     * Register a user using phone number and password.
     * @param phone - The user's phone number.
     * @param password - The user's password.
     * @returns A Result containing the signed-up user or an Exception.
     */
    SignupWithPhoneNumberAndPassword<T>({ phone, password }: { phone: string, password: string }): Promise<Result<T, Exception>>;

    // ---------------------------
    // Login Methods
    // ---------------------------

    /**
     * Authenticate a user using email and password.
     * @param email - The user's email address.
     * @param password - The user's password.
     * @returns A Result containing the authenticated user or an Exception.
     */
    SignInWithEmailAndPassword<T>({ email, password }: { email: string, password: string }): Promise<Result<T, Exception>>;

    /**
     * Authenticate a user using phone number and password.
     * @param phone - The user's phone number.
     * @param password - The user's password.
     * @returns A Result containing the authenticated user or an Exception.
     */
    SignInWithPhoneNumberAndPassword<T>({ phone, password }: { phone: string, password: string }): Promise<Result<T, Exception>>;

    // ---------------------------
    // Two-Factor Authentication (2FA) for Login
    // ---------------------------

    /**
     * Begin a multi-factor authentication login process.
     * @param option - Options for the 2FA process, such as email, SMS, or authenticator app.
     * @returns A Result containing the authentication payload or an Exception.
     */
    MultiAuthSignIn<T>(option: TwoFactorAuthOptions): Promise<Result<T, Exception>>;

    /**
     * Verify the 2FA login token.
     * @param token - The token received via the selected 2FA method.
     * @returns A Result containing the authenticated user or an Exception.
     */
    MultiAuthSignInVerification<T>(token: string): Promise<Result<T, Exception>>;

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
    SendEmailVerificationLink(uid: string): Promise<Result<void, Exception>>;

    /**
     * Verify the email verification link.
     * @param token - The verification token from the link.
     * @returns A Result indicating success or an Exception.
     */
    VerifyEmailVerificationLink(token: string): Promise<Result<void, Exception>>;

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








class Auth implements FlareAuth {

    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient()

    }

    async CreateNewUser<T extends Prisma.UserCreateInput, R>({ user }: { user: Prisma.UserCreateInput; }): Promise<Result<R, Exception>> {

        try {
            const existingUser = await this.findUser(user.email);
            if (existingUser.isSome()) return new Err(new UnauthorizedException("User with email already exist"))

            // Encrypt password 
            user.password = hashPasswordWithSalt(user.password, user.phone ?? "")

            const createdUser = await this.prisma.user.create({ data: user })
            return new Ok(createdUser as R)
        } catch (error: any) {

            return new Err(new InternalException("Unable to create user."))
        }
    }


    async SignupWithEmailAndPassword<T>({ email, password }: { email: string; password: string; }): Promise<Result<T, Exception>> {

        try {

            const existingUser = await this.findUser(email)
            if (existingUser.isSome()) return new Err(new UnauthorizedException("User with email already exist"));

            const createdUser = await this.prisma.user.create({
                data: {
                    email: email,
                    password: password,
                }
            })

            return new Ok(createdUser as T)


        } catch (error: any) {
            return new Err(new InternalException("Failed to signup user"))
        }
    }



    SignupWithPhoneNumberAndPassword<T>({ phone, password }: { phone: string; password: string; }): Promise<Result<T, Exception>> {
        // No implementation 
        throw new Err("No implementation yet")
    }

    async SignInWithEmailAndPassword<T>({ email, password }: { email: string; password: string; }): Promise<Result<T, Exception>> {

        try {

            const result = await this.findUser(email)

            if (result.isNone()) return new Err(new UnauthorizedException("User not found."))


            const user = result.unwrap()

            // Password verification 
            if (!verifyPassword(password, user.password, user.phone ?? "")) return new Err(new UnauthorizedException("Invalid email or password"))

            // Payload 
            const { password: pwd, ...payload } = user

            // Generate the access token 
            const accessToken = injector.jwtService.generateAccessToken({ payload })

            return new Ok({
                accessToken,
                auth_type: "Bearer",
                expire_in: "1h"
            } as T)

        } catch (e: any) {
            return new Err(new InternalException("Failed to signin user: " + e.message))
        }
    }


    SignInWithPhoneNumberAndPassword<T>({ phone, password }: { phone: string; password: string; }): Promise<Result<T, Exception>> {
        throw new Error("Method not implemented.");
    }

    async MultiAuthSignIn<T>(option: TwoFactorAuthOptions): Promise<Result<T, Exception>> {
        throw new Error("Method not implemented.");
    }
    async MultiAuthSignInVerification<T>(token: string): Promise<Result<T, Exception>> {
        throw new Error("Method not implemented.");
    }


    SignWithAuthProvider<T>({ provider }: { provider: Provider; }): Result<T, Exception> {
        throw new Error("Method not implemented.");
    }

    async SendEmailVerificationLink(uid: string): Promise<Result<void, Exception>> {
        try { 

            

        } catch (error: any) {
            return new Err(new InternalException("Failed to send verification link: " + error.message))
        }
    }
    VerifyEmailVerificationLink(token: string): Result<void, Exception> {
        throw new Error("Method not implemented.");
    }
    SendPasswordResetLink(uid: string): Result<void, Exception> {
        throw new Error("Method not implemented.");
    }
    VerifyPasswordResetLink<T>(token: string): Result<T, Exception> {
        throw new Error("Method not implemented.");
    }
    setNewPassword<T>({ resetToken, setNewPassword }: { resetToken: string; setNewPassword: string; }): Result<T, Exception> {
        throw new Error("Method not implemented.");
    }
    changePassword<T>({ uid, oldPassword, newPassword }: { uid: string; oldPassword: string; newPassword: string; }): Result<T, Exception> {
        throw new Error("Method not implemented.");
    }


    async findUser<U extends User>(email: string): Promise<Option<U>> {

        const user = await this.prisma.user.findUnique({
            where: {
                email: email
            }

        })

        if (!user) return new None;

        return new Some(user as U)

    }
}
