class UnauthorizedException extends Exception {
    constructor(message: string) {
        super(message, 401);
    }

    format(): string {
        return `UnauthorizedException [${this.code}]: ${this.message}`;
    }
}


