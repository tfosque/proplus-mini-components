import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StormsComponent } from './storms.component';

describe('StormsComponent', () => {
    let component: StormsComponent;
    let fixture: ComponentFixture<StormsComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [StormsComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StormsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
