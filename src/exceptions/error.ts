abstract class Exception extends Error {
    public readonly name: string;
    public readonly message: string;
    public readonly code: number;
    public readonly details?: any;
    public readonly timestamp: string;

    constructor(message: string, code: number, details?: any) {
        super(message);

        // Set the prototype explicitly for custom error classes
        Object.setPrototypeOf(this, new.target.prototype);

        this.name = this.constructor.name;
        this.message = message;
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();

        // Capture the stack trace
        Error.captureStackTrace(this, this.constructor);
    }

    abstract format(): string;
}
