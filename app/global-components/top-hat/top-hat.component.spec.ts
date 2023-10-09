import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TopHatComponent } from './top-hat.component';

xdescribe('TopHatComponent', () => {
    let component: TopHatComponent;
    let fixture: ComponentFixture<TopHatComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [TopHatComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TopHatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
