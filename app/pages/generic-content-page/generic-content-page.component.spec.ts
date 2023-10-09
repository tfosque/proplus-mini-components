import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GenericContentPageComponent } from './generic-content-page.component';

xdescribe('GenericContentPageComponent', () => {
    let component: GenericContentPageComponent;
    let fixture: ComponentFixture<GenericContentPageComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [GenericContentPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GenericContentPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
