import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DropdownOnHoverComponent } from './dropdown-on-hover.component';

describe('DropdownOnHoverComponent', () => {
    let component: DropdownOnHoverComponent;
    let fixture: ComponentFixture<DropdownOnHoverComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [DropdownOnHoverComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DropdownOnHoverComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
