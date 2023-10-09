import { DOCUMENT } from '@angular/common';
import {
    Directive,
    ElementRef,
    Inject,
    AfterViewInit,
    Input,
    Output,
    EventEmitter,
} from '@angular/core';
import { WINDOW } from '../../services/window-service.service';

@Directive({
    selector: '[scriptLoader]',
})
export class ScriptLoaderDirective implements AfterViewInit {
    @Input() scriptLoader!: string;
    @Input() type!: 'async' | 'defer';

    @Output() scriptLoaded: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor(
        private el: ElementRef,
        @Inject(DOCUMENT) private document: Document,
        @Inject(WINDOW) private window: Window
    ) {}

    ngAfterViewInit() {
        // only run this is there is a window, which means we are in the browser
        if (!!this.window) {
            const script = this.document.createElement('script');
            script.type = 'text/javascript';
            script.src = this.scriptLoader;

            if (this.type && this.type === 'async') {
                script.async = true;
            }

            if (this.type && this.type === 'defer') {
                script.defer = true;
            }

            // Append the script to the DOM and emit the event.
            // This directive is a general script loader so we can't know specifically when the script has loaded.
            // but we can use setTimeout to move emitting the event to bottom of the stack in order give it some time.
            this.el.nativeElement.appendChild(script).onload = () => {
                setTimeout(() => {
                    this.scriptLoaded.emit(true);
                }, 0);
            };
        }
    }
}
