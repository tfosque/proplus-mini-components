import { AppError } from './../common-components/classes/app-error';

export async function doTask<T>(taskName: string, fTask: () => Promise<T>) {
    try {
        return await fTask();
    } catch (error) {
        switch (taskName) {
            case 'Retrieve list of users':
                throw new AppError('No asigned users');

            default:
                throw new Error('Error, please contact the administrator');
        }
    }
}
