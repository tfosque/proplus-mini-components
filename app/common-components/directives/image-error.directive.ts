import { Directive, HostBinding, HostListener, Input } from '@angular/core';

@Directive( {
  selector: '[appImageError]'
} )
export class ImageErrorDirective {
  @Input() fallbackImgSrc = '';

  constructor() {
    // console.log( 'fallback:', this )
  }

  @Input() src!: string;

  @HostBinding( 'src' )
  get originalSrc() {
    return this.src;
  }
  get originalFallbackImg() {
    return this.fallbackImgSrc;
  }

  @HostListener( 'error' ) onError() {
    this.src = 'https://beaconproplus.com' + this.originalFallbackImg;
  }

}
