import {
    Component,
    OnInit,
    ElementRef,
    Renderer2,
    Input,
    AfterViewInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { BrBaseContentComponent } from '../../core/BrBaseContentComponent';

@Component({
    selector: 'app-custom-rich-text',
    templateUrl: './custom-rich-text.component.html',
    styleUrls: ['./custom-rich-text.component.scss'],
})
export class CustomRichTextComponent
    extends BrBaseContentComponent
    implements OnInit, AfterViewInit
{
    @Input() htmlContent!: string;
    @Input() cssClass!: string;

    private readonly clickListeners: Function[] = [];

    constructor(
        private readonly el: ElementRef,
        private readonly renderer: Renderer2,
        private readonly router: Router
    ) {
        super();
    }

    ngOnInit() {
        if (this.content) {
            const { cssClass, htmlContent } = this.content;
            this.cssClass = cssClass;
            this.htmlContent = htmlContent;
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
}
