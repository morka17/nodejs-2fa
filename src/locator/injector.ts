import { JWTServices } from "../security/jwt";


type ServiceMap = {
    jwtService: JWTServices;
    // Add other services here
};

class ServiceInjector {
    private services: Partial<ServiceMap> = {};

    get jwtService(): JWTServices {
        if (!this.services.jwtService) {
            const secret = process.env.JWT_SECRET || 'default_secret';
            this.services.jwtService = new JWTServices(secret);
        }
        return this.services.jwtService;
    }

    // Add other service initializers here
}

export const injector = new ServiceInjector();
