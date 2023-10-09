import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TemplateDetailPageComponent } from './template-detail-page.component';

xdescribe('TemplateDetailPageComponent', () => {
    let component: TemplateDetailPageComponent;
    let fixture: ComponentFixture<TemplateDetailPageComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [TemplateDetailPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TemplateDetailPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
