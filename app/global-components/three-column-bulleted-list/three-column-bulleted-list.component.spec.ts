import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ThreeColumnBulletedListComponent } from './three-column-bulleted-list.component';

xdescribe('ThreeColumnBulletedListComponent', () => {
    let component: ThreeColumnBulletedListComponent;
    let fixture: ComponentFixture<ThreeColumnBulletedListComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ThreeColumnBulletedListComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ThreeColumnBulletedListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
