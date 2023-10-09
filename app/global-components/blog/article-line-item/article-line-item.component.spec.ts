import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ArticleLineItemComponent } from './article-line-item.component';

describe('ArticleLineItemComponent', () => {
    let component: ArticleLineItemComponent;
    let fixture: ComponentFixture<ArticleLineItemComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ArticleLineItemComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ArticleLineItemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
