import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ImageCardSectionComponent } from './image-card-section.component';

xdescribe('ImageCardSectionComponent', () => {
    let component: ImageCardSectionComponent;
    let fixture: ComponentFixture<ImageCardSectionComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ImageCardSectionComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ImageCardSectionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
