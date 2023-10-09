import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ImageExpandedModalComponent } from './image-expanded-modal.component';

xdescribe('ImageExpandedModalComponent', () => {
    let component: ImageExpandedModalComponent;
    let fixture: ComponentFixture<ImageExpandedModalComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ImageExpandedModalComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ImageExpandedModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
