import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { SpanishEnvironment } from '../models/spanish-environment';


@Injectable( {
    providedIn: 'root'
} )
export class SpanishTranslationService {
    private spanishRef = new BehaviorSubject<SpanishEnvironment>( { spanishUrl: '', englishUrl: '', showSpanishBtn: false, showEnglishBtn: false } );
    public spanishRef$ = this.spanishRef.asObservable();
    private currLocation = new BehaviorSubject<string>( '' );
    public currLocation$ = this.currLocation.asObservable();




    public getSpanishEnviron(): void {
        const loc = window.location.href;

        if ( environment.local ) {
            // console.log( 'localServer' );
            const spanishUrl = 'https://esus-dev-becn.stageb.onelink-translations.com';
            const englishUrl = 'http://localhost:4200';

            const nextRef = { ...this.spanishRef.value, spanishUrl, englishUrl, showSpanishBtn: this.showSpanishButton( loc ), showEnglishBtn: this.showEnglishButton( loc ) };
            this.spanishRef.next( nextRef );

        } else if ( environment.devServer ) {
            console.log( 'devServer' );
            const spanishUrl = 'https://esus-dev-becn.stageb.onelink-translations.com';
            const englishUrl = 'https://angular-v15.becn.digital';

            const nextRef = { ...this.spanishRef.value, spanishUrl, englishUrl, showSpanishBtn: this.showSpanishButton( loc ), showEnglishBtn: this.showEnglishButton( loc ) };
            this.spanishRef.next( nextRef );

        } else if ( environment.uatServer ) {
            console.log( 'uatServer' );
            const spanishUrl = ''; // TODO setup uat for spanish
            const englishUrl = 'https://uat-v15.becn.digital';

            const nextRef = { ...this.spanishRef.value, spanishUrl, englishUrl, showSpanishBtn: this.showSpanishButton( loc ), showEnglishBtn: this.showEnglishButton( loc ) };
            this.spanishRef.next( nextRef );

        } else if ( environment.prodServer ) {
            console.log( 'prodServer' );
            const spanishUrl = 'https://es.becn.com';
            const englishUrl = 'https://becn.com';

            const nextRef = { ...this.spanishRef.value, spanishUrl, englishUrl, showSpanishBtn: this.showSpanishButton( loc ), showEnglishBtn: this.showEnglishButton( loc ) };
            this.spanishRef.next( nextRef );

        } else {
            console.log( 'server environment not recongized......' );
        }
    }

    private showSpanishButton( loc: string ) {
        // 'https://uat.becn.digital, https://becn.com, https://dev.becn.digital, 'http://localhost:4200
        // console.log( 'spanishBtn', { loc }, loc === 'https://becn.com' || loc === 'becn.com' || loc.includes( '.digital' ) || loc.includes( 'localhost' ) || !loc.includes( '//es' ) );
        return loc === 'https://becn.com' || loc === 'becn.com' || loc.includes( '.digital' ) || loc.includes( 'localhost' ) || !loc.includes( '//es' );
    }
    private showEnglishButton( loc: string ) {
        // 'https://esus-dev-becn.stageb.onelink-translations.com, 'https://esus-uat-becn.stageb.onelink-translations.com, 'https://es.becn.com,
        // console.log( 'englishBtn', { loc }, loc.includes( 'onelink-translations' ) || loc.includes( '//es' ) );
        return ( loc.includes( 'onelink-translations' ) || loc.includes( '//es' ) );
    }

}
