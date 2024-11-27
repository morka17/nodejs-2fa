import crypto from "crypto"


export function hashPasswordWithSalt(password: string, salt: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(password + salt);
    return hash.digest('hex');
}




export function verifyPassword(inputPassword: string, storedPassword: string, salt: string): boolean {
    const hashedInput = hashPasswordWithSalt(inputPassword, salt);
    return hashedInput === storedPassword; 
}