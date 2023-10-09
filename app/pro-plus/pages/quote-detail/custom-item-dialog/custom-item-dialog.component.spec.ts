import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CustomItemDialogComponent } from './custom-item-dialog.component';

xdescribe('CustomItemDialogComponent', () => {
    let component: CustomItemDialogComponent;
    let fixture: ComponentFixture<CustomItemDialogComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CustomItemDialogComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CustomItemDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
