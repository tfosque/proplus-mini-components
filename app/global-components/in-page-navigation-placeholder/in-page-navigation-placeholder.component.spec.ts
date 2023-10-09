import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InPageNavigationPlaceholderComponent } from './in-page-navigation-placeholder.component';

xdescribe('InPageNavigationPlaceholderComponent', () => {
    let component: InPageNavigationPlaceholderComponent;
    let fixture: ComponentFixture<InPageNavigationPlaceholderComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [InPageNavigationPlaceholderComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InPageNavigationPlaceholderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
