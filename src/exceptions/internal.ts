class InternalException extends Exception {
    constructor(message: string) {
        super(message, 500);
    }

    format(): string {
        return `Internal server Code [${this.code}]: ${this.message}`;
    }
}


