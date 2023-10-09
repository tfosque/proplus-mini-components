import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SingleRowBulletedListComponent } from './single-row-bulleted-list.component';

xdescribe('SingleRowBulletedListComponent', () => {
    let component: SingleRowBulletedListComponent;
    let fixture: ComponentFixture<SingleRowBulletedListComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [SingleRowBulletedListComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SingleRowBulletedListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
