import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BeaconDialogComponent } from './beacon-dialog.component';

xdescribe('BeaconDialogComponent', () => {
    let component: BeaconDialogComponent;
    let fixture: ComponentFixture<BeaconDialogComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [BeaconDialogComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BeaconDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
