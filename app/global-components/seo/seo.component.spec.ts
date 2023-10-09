import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SeoComponent } from './seo.component';

xdescribe('SeoComponent', () => {
    let component: SeoComponent;
    let fixture: ComponentFixture<SeoComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [SeoComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SeoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
