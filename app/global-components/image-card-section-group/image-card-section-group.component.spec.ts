import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ImageCardSectionGroupComponent } from './image-card-section-group.component';

xdescribe('ImageCardSectionGroupComponent', () => {
    let component: ImageCardSectionGroupComponent;
    let fixture: ComponentFixture<ImageCardSectionGroupComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ImageCardSectionGroupComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ImageCardSectionGroupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
