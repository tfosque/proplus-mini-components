import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DeleteItemDialogComponent } from './delete-item-dialog.component';

xdescribe('DeleteItemDialogComponent', () => {
    let component: DeleteItemDialogComponent;
    let fixture: ComponentFixture<DeleteItemDialogComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [DeleteItemDialogComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DeleteItemDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
