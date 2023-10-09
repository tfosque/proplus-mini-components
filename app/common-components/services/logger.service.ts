import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root',
})
export class LoggerService {
    isEnabled = false;
    name = 'Unspecified';

    constructor(private readonly snackBar: MatSnackBar) {}

    setName(newName: string) {
        this.name = newName;
        return this;
    }

    userError<T>(message: string) {
        this.snackBar.open(message, 'Close');
    }

    log<T>(event: string, payload: T) {
        if (this.isEnabled) {
            // tslint:disable-next-line: no-console
            console.log(`${this.name} -- ${event}`, payload);
        }
    }
}
