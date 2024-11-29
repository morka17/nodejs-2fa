class UnauthorizedException extends Exception {
    constructor(message: string) {
        super(message, 401);
    }

    format(): string {
        return `UnauthorizedException [${this.code}]: ${this.message}`;
    }
}



class NotFoundException extends Exception {
    constructor(message: string) {
        super(message, 404);
    }

    format(): string {
        return `NotFoundException [${this.code}]: ${this.message}`;
    }
}

