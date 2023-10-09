import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProplusMasterPageComponent } from './proplus-master-page.component';

xdescribe('ProplusMasterPageComponent', () => {
    let component: ProplusMasterPageComponent;
    let fixture: ComponentFixture<ProplusMasterPageComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ProplusMasterPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProplusMasterPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
