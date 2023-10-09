export class ApiError<T> extends Error {
    constructor(message: string, public response: T) {
        super(message);
    }
}
