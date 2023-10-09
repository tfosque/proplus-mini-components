import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DetailDialogComponent } from './detail-dialog.component';

xdescribe('DetailDialogComponent', () => {
    let component: DetailDialogComponent;
    let fixture: ComponentFixture<DetailDialogComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [DetailDialogComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DetailDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
