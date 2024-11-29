import { TwoFactorAuthOptions } from "./2fa";
import { None, Option, Some } from "./helper-func/option";
import { err, Err, Ok, ok, Result } from "./helper-func/result";
import { PrismaClient, Prisma, User } from "@prisma/client"
import { hashPasswordWithSalt, verifyPassword } from "./security/password";
import { injector } from "./locator/injector";
import { emailWorkerQueue } from "./configs/redis.config";



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
    SignWithAuthProvider<T>({ provider }: { provider: Provider }): Promise<Result<T, Exception>>;

    // ---------------------------
    // Email Verification
    // ---------------------------

    /**
     * Send a verification link to the user's email address.
     * @param uid - The user ID for whom to send the verification link.
     * @returns A Result indicating success or an Exception.
     */
    SendEmailVerificationLink<T extends EmailTask>(email: string): Promise<Result<T, Exception>>;

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
    SendPasswordResetLink<T extends EmailTask>(email: string): Promise<Result<T, Exception>>;

    /**
     * Verify the password reset token and allow the user to set a new password.
     * @param token - The reset token from the email.
     * @returns A Result containing the updated user or an Exception.
     */
    VerifyPasswordResetLink<T>(token: string): Promise<Result<T, Exception>>;

    /**
     * Set a new password after password reset verification.
     * @param resetToken - The reset token from the verification process.
     * @param setNewPassword - The new password to be set.
     * @returns A Result containing the updated user or an Exception.
     */
    setNewPassword<T>({ resetToken, newPassword }: { resetToken: string, newPassword: string }): Promise<Result<T, Exception>>;

    /**
     * Change an existing user's password.
     * @param uid - The user's unique ID.
     * @param oldPassword - The user's current password.
     * @param newPassword - The new password to be set.
     * @returns A Result containing the updated user or an Exception.
     */
    changePassword<T>({ uid, oldPassword, newPassword }: { uid: number, oldPassword: string, newPassword: string }): Promise<Result<T, Exception>>;
}








class Auth implements FlareAuth {

    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient()

    }

    async CreateNewUser<R>({ user }: { user: Prisma.UserCreateInput; }): Promise<Result<R, Exception>> {

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

            // Check for new device signin to ensure 2FA 
            const isNewDeviceSignin = await this.isNewDeviceSignin({ ip: , userAgent: , uid: , });
            if (isNewDeviceSignin.isErr()) return new Err(new InternalException(isNewDeviceSignin.unwrapErr().message))

            if (isNewDeviceSignin.unwrap()) {
                // forward to 2FA security system 
                const options: TwoFactorAuthOptions = {
                    userId: +user.id
                    method: user.is2FAEnabled
                    secret?: string;
                    email?: user.email;
                    phoneNumber?: string;
                }
                return this.MultiAuthSignIn<T>();
            }



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


    SignWithAuthProvider<T>({ provider }: { provider: Provider; }): Promise<Result<T, Exception>> {
        throw new Error("Method not implemented.");
    }

    async SendEmailVerificationLink<T extends EmailTask>(email: string): Promise<Result<T, Exception>> {
        try {

            // Ver Token Payload 
            const payload = {
                email
            }

            const result = await this.findUser(email)
            if (result.isNone()) return new Err(new NotFoundException("User not found"))

            // Generate Verification Token 
            const token = injector.jwtService.generateAccessToken(payload)

            // content  
            const task: EmailTask = {
                to: email,
                subject: "Email Verification",
                token: token,
                type: EmailType.EmailVerification
            }

            const _result = await emailWorkerQueue.add(task)
            if (await _result.isFailed()) return new Err(new InternalException("Failed to send verification email"))

            return new Ok({ id: _result.id, ..._result.data } as any as T);

        } catch (error: any) {
            return new Err(new InternalException("Failed to send verification link: " + error.message))
        }
    }

    async VerifyEmailVerificationLink(token: string): Promise<Result<void, Exception>> {

        try {

            const result = injector.jwtService.verifyToken<{ email: string }>(token)
            if (result.isErr()) return new Err(result.unwrapErr())

            // update user to verified 
            await this.prisma.user.update({
                where: {
                    email: result.unwrap().email
                },
                data: {
                    isVerified: true
                }
            })

            return new Ok(undefined)


        } catch (error: any) {

            return new Err(new InternalException("Failed to verify email " + error.message))
        }
    }

    async SendPasswordResetLink<T extends EmailTask>(email: string): Promise<Result<T, Exception>> {
        try {

            // Ver Token Payload 
            const payload = {
                email
            }

            // Generate Verification Token 
            const token = injector.jwtService.generateAccessToken(payload)

            // content  
            const task: EmailTask = {
                to: email,
                subject: "Password Reset Verification",
                token: token,
                type: EmailType.PasswordReset
            }

            const _result = await emailWorkerQueue.add(task)

            if (await _result.isFailed()) return new Err(new InternalException(`Failed to send link: ${_result.failedReason}`))

            return new Ok({ id: _result.id, ..._result.data } as unknown as T);

        } catch (error: any) {
            return new Err(new InternalException("Failed to reset password link: " + error.message))
        }

    }
    async VerifyPasswordResetLink<T>(token: string): Promise<Result<T, Exception>> {
        try {

            const result = injector.jwtService.verifyToken<{ email: string }>(token)
            if (result.isErr()) return new Err(result.unwrapErr())


            return new Ok("Successful" as T)

        } catch (error: any) {
            return new Err(new InternalException("Failed to verify password reset token"))
        }

    }
    async setNewPassword<T>({ resetToken, newPassword }: { resetToken: string; newPassword: string; }): Promise<Result<T, Exception>> {


        try {
            const result = injector.jwtService.verifyToken<{ email: string }>(resetToken);
            if (result.isErr()) return new Err(new UnauthorizedException("Invalid reset token"))

            const uResult = await this.findUser(result.unwrap().email)

            if (uResult.isNone()) return new Err(new NotFoundException("User Not Found"));

            const user = uResult.unwrap()

            const hashedPassword = hashPasswordWithSalt(newPassword, user.phone ?? "");

            const _u = await this.prisma.user.update({
                where: {
                    email: user.email
                },
                data: {
                    password: hashedPassword
                }
            })

            return new Ok(_u as T)


        } catch (error: any) {
            return new Err(new InternalException("Failed to set new Password"))
        }
    }
    async changePassword<T>({ uid, oldPassword, newPassword }: { uid: number; oldPassword: string; newPassword: string; }): Promise<Result<T, Exception>> {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    id: uid
                }
            })

            if (!user) return new Err(new UnauthorizedException("Invalid user"))

            if (!verifyPassword(oldPassword, user.password, user.phone ?? "")) return new Err(new UnauthorizedException("Incorrect password"))

            const hashedPassword = hashPasswordWithSalt(newPassword, user.phone ?? "")
            const _u = await this.prisma.user.update({
                where: {
                    id: uid,
                },
                data: {
                    password: hashedPassword
                }
            })

            return new Ok(_u as T)

        } catch (error: any) {
            return new Err(new InternalException("Failed to reset password"))
        }
    }


    async findUser<U extends User>(email: string): Promise<Option<U>> {

        try {

            const user = await this.prisma.user.findUnique({
                where: {
                    email: email
                }

            })

            if (!user) return new None;

            return new Some(user as U)
        } catch (error: any) {
            return new None;
        }

    }

    async isVerified(email: string): Promise<Result<Boolean, Error>> {
        const result = await this.findUser(email)
        if (result.isNone()) return new Err(new UnauthorizedException("User Not Found"))

        const { isVerified } = result.unwrap()
        return new Ok(isVerified)
    }

    async isNewDeviceSignin({ ip, userAgent, uid }: { ip: string, userAgent: string, uid: number }): Promise<Result<Boolean, Exception>> {

        try {
            const metadata = await this.prisma.userMetaData.findUnique({
                where: {
                    id: uid
                }
            })

            if (!metadata) return new Ok(false)
            if (metadata.lastUserAgent !== userAgent.trim()) return new Ok(false)

            return new Ok(true);
        } catch (error: any) {
            return new Err(new InternalException("Failed to retrieve signin info."))
        }
    }
}
