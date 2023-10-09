let doTrace = false;

export function setTrace(on: boolean) {
    doTrace = on;
}

// tslint:disable-next-line: no-any
export function trace(message: any, ...optionParameters: any[]) {
    if (doTrace) {
        // tslint:disable-next-line: no-console
        console.log(message, ...optionParameters);
    }
}

// tslint:disable-next-line: no-any
export function logError(message: any, ...optionParameters: any[]) {
    console.error(message, ...optionParameters);
}
