import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TemplateBrowsePageComponent } from './template-browse-page.component';

xdescribe('TemplateBrowsePageComponent', () => {
    let component: TemplateBrowsePageComponent;
    let fixture: ComponentFixture<TemplateBrowsePageComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [TemplateBrowsePageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TemplateBrowsePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
