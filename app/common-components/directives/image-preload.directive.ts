import { Directive, Input, HostListener, ElementRef } from '@angular/core';

@Directive( {
    selector: 'img[appImagePreload]',
} )
export class ImagePreloadDirective {
    @Input() default!: string;

    constructor( private readonly el: ElementRef ) { }

    // If there is an error loading an image, change the url to the supplied default string.
    @HostListener( 'error' )
    updateUrl() {
        // console.log( 'this.default....', this.default )
        //  Only set the src if the default image is set.
        //  Otherwise, this can result in a bug where, in some scenarios, it requests an
        //  image at the url:  "/undefined".
        if ( this.default ) {
            this.el.nativeElement.src = this.default;
        }
    }
}
