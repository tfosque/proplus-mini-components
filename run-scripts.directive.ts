import { Directive, OnInit, ElementRef, Renderer2 } from '@angular/core';

/**
 * This directives removes and readds scripts to dom to cass them to be executed.  This is potentially dangerous and
 * should be used in limited cases.
 */
@Directive({
    selector: '[appRunScripts]',
})
export class RunScriptsDirective implements OnInit {
    constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

    ngOnInit(): void {
        setTimeout(() => {
            // wait for DOM rendering
            this.reinsertScripts();
        });
    }

    reinsertScripts(): void {
        const scripts: HTMLScriptElement[] = this.elementRef.nativeElement.getElementsByTagName(
            'script'
        );
        const scriptsInitialLength = scripts.length;
        for (let i = 0; i < scriptsInitialLength; i++) {
            const script = scripts[i];
            const scriptCopy: HTMLScriptElement = this.renderer.createElement(
                'script'
            );
            scriptCopy.type = script.type ? script.type : 'text/javascript';
            if (script.innerHTML) {
                scriptCopy.innerHTML = script.innerHTML;
            } else if (script.src) {
                scriptCopy.src = script.src;
            }

            // Added this so that we can load the "optinmonster" script after the rest of the app has initialized.
            // TODO: more intelligently copy over data-rels.
            if (script.dataset) {
                const dataset = script.dataset;

                if (dataset.account) {
                    scriptCopy.setAttribute('data-account', dataset.account);
                }

                if (dataset.user) {
                    scriptCopy.setAttribute('data-user', dataset.user);
                }
            }

            scriptCopy.async = false;
            if (script.parentNode) {
                script.parentNode.replaceChild(scriptCopy, script);
            }
        }
    }
}
