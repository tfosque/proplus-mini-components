import { EncodeUriComponentPipe } from './encode-uri-component.pipe';

xdescribe('EncodeUriComponentPipe', () => {
    it('create an instance', () => {
        const pipe = new EncodeUriComponentPipe();
        expect(pipe).toBeTruthy();
    });
});
