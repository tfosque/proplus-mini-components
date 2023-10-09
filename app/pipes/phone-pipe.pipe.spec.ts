import { PhonePipePipe } from './phone-pipe.pipe';

xdescribe('PhonePipePipe', () => {
    it('create an instance', () => {
        const pipe = new PhonePipePipe();
        expect(pipe).toBeTruthy();
    });
});
