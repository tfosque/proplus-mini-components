import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DeleteAddressDialogComponent } from './delete-address-dialog.component';

xdescribe('DeleteAddressDialogComponent', () => {
    let component: DeleteAddressDialogComponent;
    let fixture: ComponentFixture<DeleteAddressDialogComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [DeleteAddressDialogComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DeleteAddressDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
