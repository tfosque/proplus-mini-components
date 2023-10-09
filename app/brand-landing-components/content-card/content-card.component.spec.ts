import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContentCardComponent } from './content-card.component';

xdescribe('ContentCardComponent', () => {
    let component: ContentCardComponent;
    let fixture: ComponentFixture<ContentCardComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ContentCardComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ContentCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
