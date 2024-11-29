import { Result } from 'ioredis';
import { Err, Ok } from '../../helper-func/result';


interface SmsProvider {
    create(props: Object): Promise<any>;
}


export default class SmsService {
    private smsProvider: SmsProvider;

    constructor(smsProvider: SmsProvider) {
        this.smsProvider = smsProvider
    }

    async sendOtp<T>(payload: SmsOtpPayload): Promise<Result<T, any>> {
        const { phoneNumber, otpCode, message, senderName, expiryTime } = payload;

        // Example SMS message
        const fullMessage = `${message}: Your OTP is ${otpCode}${expiryTime ? ` (valid for ${expiryTime} seconds)` : ''
            }`;

        try {
            const response = await this.smsProvider.create({
                to: phoneNumber,
                body: fullMessage,
                from: senderName
            });

            return new Ok(response.body as T)
        } catch (error: any) {
            return new Err(new InternalException(`Failed to send SMS: ${error.message}`))
        }
    }
}
