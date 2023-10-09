import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NavigableContentContainerComponent } from './navigable-content-container.component';

xdescribe('NavigableContentContainerComponent', () => {
    let component: NavigableContentContainerComponent;
    let fixture: ComponentFixture<NavigableContentContainerComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [NavigableContentContainerComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NavigableContentContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
