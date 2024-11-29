enum EmailType {
    EmailVerification = 1,
    PasswordReset = 2,
}


interface EmailTask {
    token: string;
    to: string;
    subject: string;
    type: EmailType,
}  