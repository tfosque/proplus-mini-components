import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SkuSelectorComponent } from './sku-selector.component';

xdescribe('SkuSelectorComponent', () => {
    let component: SkuSelectorComponent;
    let fixture: ComponentFixture<SkuSelectorComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [SkuSelectorComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SkuSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
