import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScriptLoaderDirective } from './script-loader.directive';

describe('WistiaLoaderDirective', () => {
    let fixture: ComponentFixture<ScriptLoaderDirective>;

    beforeEach(() => {
        fixture = TestBed.configureTestingModule({
            declarations: [ScriptLoaderDirective],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).createComponent(ScriptLoaderDirective);
        fixture.detectChanges();
    });

    it('should create an instance', () => {
        expect(fixture).toBeTruthy();
    });
});
