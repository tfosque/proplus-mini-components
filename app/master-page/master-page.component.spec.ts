import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MasterPageComponent } from './master-page.component';

xdescribe('MasterPageComponent', () => {
    let component: MasterPageComponent;
    let fixture: ComponentFixture<MasterPageComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [MasterPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MasterPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
