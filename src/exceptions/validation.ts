class ValidationException extends Exception {
    constructor(message: string, details?: any) {
        super(message, 400, details);
    }

    format(): string {
        return `ValidationException [${this.code}]: ${this.message} | Details: ${JSON.stringify(this.details)}`;
    }
}



