interface SmsOtpPayload {
    phoneNumber: string;
    otpCode: string;
    message: string;
    senderName?: string;
    expiryTime?: number;
}
