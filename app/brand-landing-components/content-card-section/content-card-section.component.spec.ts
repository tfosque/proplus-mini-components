import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContentCardSectionComponent } from './content-card-section.component';

xdescribe('ContentCardSectionComponent', () => {
    let component: ContentCardSectionComponent;
    let fixture: ComponentFixture<ContentCardSectionComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ContentCardSectionComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ContentCardSectionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
