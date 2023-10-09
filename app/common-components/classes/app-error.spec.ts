import { AppError } from './app-error';

xdescribe('AppError', () => {
    it('should create an instance', async () => {
        await expect(new AppError('Hi')).toBeTruthy();
    });
});
