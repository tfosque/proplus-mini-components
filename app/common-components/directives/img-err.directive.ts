import { Directive, HostBinding, HostListener, Input } from '@angular/core';

@Directive( {
  selector: '[appImgErr]'
} )
export class ImgErrDirective {
  @Input() fallbackImgSrc = '';

  constructor() {
    console.log( 'fallback:', this.fallbackImgSrc )
  }

  @Input() src!: string;

  @HostBinding( 'src' )
  get originalSrc() {
    return this.src;
  }
  get originalFallbackImg() {
    console.log( 'fallback:', this.fallbackImgSrc )
    return this.fallbackImgSrc;
  }

  @HostListener( 'error' ) onError() {
    this.src = 'https://beaconproplus.com' + this.originalFallbackImg;
  }

}
