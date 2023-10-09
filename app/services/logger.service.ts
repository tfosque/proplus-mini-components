import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class LoggerService {
    private moduleName: string;

    constructor() {
        this.moduleName = 'Test';
    }

    public setModule(newName: string) {
        this.moduleName = newName;
    }

    public tryAction<T>(actionName: string, action: () => T): T {
        try {
            return action();
        } catch (error) {
            this.error({ module: this.moduleName, action: actionName });
            throw new Error(`Failed to ${actionName}`);
        }
    }

    public log(event: object) {
        const moduleName = this.moduleName;
        // tslint:disable-next-line: no-console
        console.log({ moduleName, event });
    }
    public error(event: object) {
        const moduleName = this.moduleName;
        console.error({ moduleName, event });
    }
}
