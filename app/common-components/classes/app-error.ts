export class AppError extends Error {
    constructor(public cleanMessage: string) {
        super(cleanMessage);
        this.name = 'Application Error';
    }
}

export class SevereError extends Error {
    constructor(public errorType: string) {
        super(errorType);
    }
}

export class ApiError<T> extends AppError {
    constructor(public readonly cleanMessage: string, public readonly body: T) {
        super(cleanMessage);
        this.name = 'Application Error';
    }
}

/**
 * Throw this error if the user is not logged in or had a bad token
 */
export class UnauthorizedError extends Error {
    constructor(public cleanMessage: string) {
        super(cleanMessage);
        this.name = 'Unauthorized Error';
    }
}

/**
 * Throw this error if the user does not have access to this resource
 */
export class ForbiddenError extends Error {
    constructor(public cleanMessage: string) {
        super(cleanMessage);
        this.name = 'ForbiddenError Error';
    }
}
