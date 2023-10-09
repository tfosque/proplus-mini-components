import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MarketingBlockComponent } from './marketing-block.component';

xdescribe('MarketingBlockComponent', () => {
    let component: MarketingBlockComponent;
    let fixture: ComponentFixture<MarketingBlockComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [MarketingBlockComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MarketingBlockComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
