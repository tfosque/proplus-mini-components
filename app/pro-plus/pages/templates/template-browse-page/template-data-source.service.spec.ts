import { TestBed } from '@angular/core/testing';

import { TemplateDataSource } from './template-data-source.service';

xdescribe('TemplateDataSourceService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: TemplateDataSource = TestBed.inject(TemplateDataSource);
        expect(service).toBeTruthy();
    });
});
