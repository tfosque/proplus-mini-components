import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ResultCardComponent } from './result-card.component';

xdescribe('ResultCardComponent', () => {
    let component: ResultCardComponent;
    let fixture: ComponentFixture<ResultCardComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ResultCardComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ResultCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
