import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BasePageComponent } from './base-page.component';

xdescribe('BasePageComponent', () => {
    let component: BasePageComponent;
    let fixture: ComponentFixture<BasePageComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [BasePageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BasePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
