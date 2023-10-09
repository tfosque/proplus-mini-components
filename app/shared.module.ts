import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { EncodeUriComponentPipe } from './pipes/encode-uri-component.pipe';
import { ErrorImagePipe } from './pipes/error-image.pipe';
import { LinkRewriterPipe } from './pipes/link-rewriter.pipe';
import { PhonePipePipe } from './pipes/phone-pipe.pipe';
import { PricePipe } from './pipes/price.pipe';
import { ProductImagePipe } from './pipes/product-image.pipe';
import { ProtocolPipe } from './pipes/protocol.pipe';
import { SafePipe } from './pipes/safe.pipe';
import { SearchPipe } from './pipes/search.pipe';
import { TimeConversionPipe } from './pipes/time-conversion.pipe';
import { TotalPricePipe } from './pipes/total-price.pipe';
import { TranslationsPipe } from './pipes/translations.pipe';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { RouterModule } from '@angular/router';


const Pipes = [
    EncodeUriComponentPipe,
    ErrorImagePipe,
    LinkRewriterPipe,
    PhonePipePipe,
    PricePipe,
    ProductImagePipe,
    ProtocolPipe,
    SafePipe,
    SearchPipe,
    TimeConversionPipe,
    TotalPricePipe,
    TranslationsPipe,
    SafeHtmlPipe,
];

@NgModule( {
    declarations: [...Pipes],
    imports: [
        CommonModule,
        RouterModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    exports: [
        CommonModule,
        RouterModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        ...Pipes,
    ],
    providers: [CurrencyPipe, SafeHtmlPipe, TranslationsPipe],
} )
export class SharedModule { }
