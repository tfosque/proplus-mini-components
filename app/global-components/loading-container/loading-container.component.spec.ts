import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LoadingContainerComponent } from './loading-container.component';

xdescribe('LoadingContainerComponent', () => {
    let component: LoadingContainerComponent;
    let fixture: ComponentFixture<LoadingContainerComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [LoadingContainerComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LoadingContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
