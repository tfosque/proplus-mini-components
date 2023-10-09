import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SaveOrderDialogComponent } from './save-order-dialog.component';

xdescribe('SaveOrderDialogComponent', () => {
    let component: SaveOrderDialogComponent;
    let fixture: ComponentFixture<SaveOrderDialogComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [SaveOrderDialogComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SaveOrderDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
