import { ProtocolPipe } from './protocol.pipe';

xdescribe('ProtocolPipe', () => {
    it('create an instance', () => {
        const pipe = new ProtocolPipe();
        expect(pipe).toBeTruthy();
    });
});
