import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PageComponentRerouterComponent } from './page-component-rerouter.component';

xdescribe('PageComponentRerouterComponent', () => {
    let component: PageComponentRerouterComponent;
    let fixture: ComponentFixture<PageComponentRerouterComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [PageComponentRerouterComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PageComponentRerouterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
