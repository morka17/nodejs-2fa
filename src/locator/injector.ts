import env from "../configs/env.config";
import { JWTServices } from "../security/jwt";
import AppNodeMailer from "../services/engines/email.engine";
import SmsService from "../services/engines/sms.engine";


type ServiceMap = {
    jwtService: JWTServices;
    smsService: SmsService;
    mailService: AppNodeMailer;

};

class ServiceInjector {
    private services: Partial<ServiceMap> = {};

    get jwtService(): JWTServices {
        if (!this.services.jwtService) {
            const secret = env.jwtSecret ?? ""
            this.services.jwtService = new JWTServices(secret);
        }
        return this.services.jwtService;
    }

    get smsService(): SmsService {
        if (!this.services.smsService) {
            // setup the sms provider 
            this.services.smsService = new SmsService(null);
        }
        return this.services.smsService;
    }

    get mailService(): AppNodeMailer {
        // setup the mailer provider 
        if (!this.services.mailService) {
            this.services.mailService = new AppNodeMailer(null)
        }
        return this.services.mailService
    }



}

export const injector = new ServiceInjector();
