import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WhereToBuyPageComponent } from './where-to-buy-page.component';

xdescribe('WhereToBuyComponent', () => {
    let component: WhereToBuyPageComponent;
    let fixture: ComponentFixture<WhereToBuyPageComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [WhereToBuyPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WhereToBuyPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
