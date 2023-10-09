import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PoDialogComponent } from './po-dialog.component';

xdescribe('PoDialogComponent', () => {
    let component: PoDialogComponent;
    let fixture: ComponentFixture<PoDialogComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [PoDialogComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PoDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
