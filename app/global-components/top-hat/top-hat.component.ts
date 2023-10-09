import { Component, OnInit, Input } from '@angular/core';
import { SpanishEnvironment } from './../../models/spanish-environment';
import { SpanishTranslationService } from './../../services/spanish-translation.service';
import { BehaviorSubject } from 'rxjs';

@Component( {
    selector: 'app-top-hat',
    templateUrl: './top-hat.component.html',
    styleUrls: ['./top-hat.component.scss'],
} )
export class TopHatComponent implements OnInit {
    spanishRef = new BehaviorSubject<SpanishEnvironment>( {
        spanishUrl: '',
        englishUrl: '',
        showEnglishBtn: false,
        showSpanishBtn: false,
    } );
    @Input() public utilityLinks!: {
        url: string;
        title: string;
        isExternal: boolean;
    }[];

    @Input() public otherSiteLinks!: {
        url: string;
        title: string;
        isExternal: boolean;
    }[];

    @Input() public currentSiteName!: string;
    @Input() public contactPhone!: string;

    constructor( private readonly spanish: SpanishTranslationService ) { }

    ngOnInit() {
        this.spanish.getSpanishEnviron();
        this.spanish.spanishRef$.subscribe( ( ref: SpanishEnvironment ) => {
            this.spanishRef.next( ref );
        } );
    }

    goToSpanish() {
        let pathname = window.location.pathname;
        let search = window.location.search;
        let spUrl = this.spanishRef.value.spanishUrl;
        console.log( { spUrl } )
        const url: string = spUrl + pathname + search;
        window.open( url, "_self" );
    }
    goToEnglish() {
        let pathname = window.location.pathname;
        let search = window.location.search;
        let enUrl = this.spanishRef.value.englishUrl;
        console.log( { enUrl } )
        const url: string = enUrl + pathname + search;
        window.open( url, "_self" );
    }

}
