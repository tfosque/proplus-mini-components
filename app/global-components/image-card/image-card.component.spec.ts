import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ImageCardComponent } from './image-card.component';

xdescribe('ImageCardComponent', () => {
    let component: ImageCardComponent;
    let fixture: ComponentFixture<ImageCardComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ImageCardComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ImageCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
