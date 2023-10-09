import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SavedOrderDetailsComponent } from './saved-order-details.component';

xdescribe('SavedOrderDetailsComponent', () => {
    let component: SavedOrderDetailsComponent;
    let fixture: ComponentFixture<SavedOrderDetailsComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [SavedOrderDetailsComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SavedOrderDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
