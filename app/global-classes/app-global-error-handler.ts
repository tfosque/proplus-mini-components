import {
    ErrorHandler,
    Injectable,
    NgZone,
    Injector,
    Inject,
    PLATFORM_ID,
} from '@angular/core';
import { MatSnackBarConfig, MatSnackBar } from '@angular/material/snack-bar';
import {
    AppError,
    UnauthorizedError,
    SevereError,
    ForbiddenError,
} from '../common-components/classes/app-error';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root',
})
export class AppGlobalErrorHandler implements ErrorHandler {
    isBrowser: boolean;
    constructor(
        @Inject(PLATFORM_ID) platformId: string,
        private readonly injector: Injector,
        private readonly snackBar: MatSnackBar,
        private readonly zone: NgZone
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    // tslint:disable-next-line: no-any
    handleError(error: any) {
        if (!this.isBrowser) {
            console.error('GLOBAL ERROR HANDLER --- ', error);
            return;
        }
        this.zone.run(() => {
            setTimeout(async () => {
                if (error.rejection) {
                    await this.reportError(error.rejection);
                } else if (error instanceof UnauthorizedError) {
                    this.showUnauthErrorMessage(error);
                } else if (error instanceof Error) {
                    await this.reportError(error);
                } else {
                    console.error('Unhandled error', error);
                    await this.reportError(error);
                }
            }, 0);
        });
    }

    // tslint:disable-next-line: no-any
    async reportError(error: any) {
        if (error === null) {
            //  Do nothing
        } else if (error instanceof SevereError) {
            const router = this.injector.get<Router>(Router);
            await router.navigate(['/error'], {
                queryParams: {
                    type: error.errorType,
                },
            });
        } else if (error instanceof UnauthorizedError) {
            this.showUnauthErrorMessage(error);
        } else if (error instanceof ForbiddenError) {
            // const router = this.injector.get<Router>(Router);
            // await router.navigate(['error'], {
            //     queryParams: {
            //         type: 'forbidden',
            //     },
            // });
        } else if (error instanceof AppError) {
            this.showAppMessage(error);
        } else if (error instanceof Error) {
            this.showErrorMessage(error);
        } else {
            this.showErrorMessage(error);
        }
    }

    private showUnauthErrorMessage(error: Error) {
        console.error('showUnauthErrorMessage', error);
        this.snackBar.open(
            `User logged out - Please log in`,
            'Close',
            getConfig()
        );
    }

    private showErrorMessage(error: Error) {
        console.error('showErrorMessage', error);
        this.snackBar.open(
            `${error.name} - ${error.message}`,
            'Close',
            getConfig()
        );
    }

    private showAppMessage(error: AppError) {
        console.error('showAppMessage', error);
        const config = getConfig();
        this.snackBar.open(`${error.cleanMessage}`, 'Close', config);
    }
}
function getConfig(): MatSnackBarConfig {
    return {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        politeness: 'assertive',
    };
}
