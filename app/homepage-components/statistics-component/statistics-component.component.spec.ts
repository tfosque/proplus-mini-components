import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StatisticsComponentComponent } from './statistics-component.component';

xdescribe('StatisticsComponentComponent', () => {
    let component: StatisticsComponentComponent;
    let fixture: ComponentFixture<StatisticsComponentComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [StatisticsComponentComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StatisticsComponentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
