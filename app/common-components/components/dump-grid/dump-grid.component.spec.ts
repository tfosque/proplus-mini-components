import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DumpGridComponent } from './dump-grid.component';

xdescribe('DumpGridComponent', () => {
    let component: DumpGridComponent;
    let fixture: ComponentFixture<DumpGridComponent>;

    beforeEach(waitForAsync(async () => {
        await TestBed.configureTestingModule({
            declarations: [DumpGridComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DumpGridComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', async () => {
        await expect(component).toBeTruthy();
    });
});
