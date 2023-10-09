import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HomeMosaicComponent } from './home-mosaic.component';

xdescribe('HomeMosaicComponent', () => {
    let component: HomeMosaicComponent;
    let fixture: ComponentFixture<HomeMosaicComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [HomeMosaicComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HomeMosaicComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
