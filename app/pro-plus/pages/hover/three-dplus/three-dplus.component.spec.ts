import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ThreeDplusComponent } from './three-dplus.component';

describe('ThreeDplusComponent', () => {
    let component: ThreeDplusComponent;
    let fixture: ComponentFixture<ThreeDplusComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ThreeDplusComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ThreeDplusComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
