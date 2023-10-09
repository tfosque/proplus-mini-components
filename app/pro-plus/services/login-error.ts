export class LoginError extends Error {
    constructor(public message: string) {
        super(message);
    }
}
