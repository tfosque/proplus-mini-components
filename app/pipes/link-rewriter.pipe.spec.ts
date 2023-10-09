import { LinkRewriterPipe } from './link-rewriter.pipe';
// import { Renderer2 } from '@angular/core';

xdescribe('LinkRewriterPipe', () => {
    let rendererSpy: { get: jasmine.Spy };

    beforeEach(() => {
        rendererSpy = jasmine.createSpyObj('Renderer2', ['get']);
    });

    it('create an instance', () => {
        const pipe = new LinkRewriterPipe(<any>rendererSpy);
        expect(pipe).toBeTruthy();
    });
});
