import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OpenQuoteComponent } from './open-quote.component';

xdescribe('OpenQuoteComponent', () => {
    let component: OpenQuoteComponent;
    let fixture: ComponentFixture<OpenQuoteComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [OpenQuoteComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OpenQuoteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
