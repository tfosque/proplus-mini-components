import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ListComponentComponent } from './list-component.component';

xdescribe('ListComponentComponent', () => {
    let component: ListComponentComponent;
    let fixture: ComponentFixture<ListComponentComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ListComponentComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ListComponentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
