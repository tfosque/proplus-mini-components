import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InformationComponent } from './information.component';

xdescribe('InformationComponent', () => {
    let component: InformationComponent;
    let fixture: ComponentFixture<InformationComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [InformationComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InformationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
