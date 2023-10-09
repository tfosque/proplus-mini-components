import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DialogContentComponent } from './dialog-content.component';

xdescribe('DialogContentComponent', () => {
    let component: DialogContentComponent;
    let fixture: ComponentFixture<DialogContentComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [DialogContentComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DialogContentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
