import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SearchNullMessageComponent } from './search-null-message.component';

xdescribe('SearchNullMessageComponent', () => {
    let component: SearchNullMessageComponent;
    let fixture: ComponentFixture<SearchNullMessageComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [SearchNullMessageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SearchNullMessageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
