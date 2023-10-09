// TODO(Tim): Beacon team to determine if component can be retired

import {
    Component,
    OnInit,
    Input,
    OnDestroy,
    AfterViewInit,
    ElementRef,
    Renderer2,
} from '@angular/core';
import { Router } from '@angular/router';
import { BrBaseContentComponent } from '../core/BrBaseContentComponent';

@Component({
    selector: 'app-rich-text',
    templateUrl: './rich-text.component.html',
    styleUrls: ['./rich-text.component.scss'],
})
export class RichTextComponent
    extends BrBaseContentComponent
    implements OnInit, OnDestroy, AfterViewInit
{
    @Input() htmlContent!: string;
    @Input() title!: string;
    @Input() noMargin!: boolean;

    private clickListeners: Function[] = [];

    constructor(
        private el: ElementRef,
        private renderer: Renderer2,
        private router: Router
    ) {
        super();
    }

    ngOnInit() {
        /**
         * Content is set differently depending on if this component is added through the cms or is included as part of a different
         * component.
         */
        if (this.content?.content?.value) {
            this.htmlContent = this.content.content.value;
            this.title = this.content.header;
        }
    }

    /**
     * If internal links are clicked use router to navigate instead of default href behavior
     */
    ngAfterViewInit() {
        const anchorNodes = this.el.nativeElement.querySelectorAll(
            'a[data-type="internal"]'
        );

        const anchors: Node[] = Array.from(anchorNodes);

        anchors.forEach((anchor) => {
            const listener = this.renderer.listen(anchor, 'click', (e) => {
                e.preventDefault();
                const route = e.srcElement.getAttribute('routerLink');
                this.router.navigateByUrl(route);
            });
            this.clickListeners.push(listener);
        });
    }

    ngOnDestroy() {
        this.clickListeners.forEach((listenerUnsub) => {
            listenerUnsub();
        });
    }
}
