import { Component, OnInit, Input } from '@angular/core';
import { ProductResources } from '../../api-response-interfaces/product-resources';
import { ProplusUrls } from '../../enums/proplus-urls.enum';

@Component({
    selector: 'app-product-documents',
    templateUrl: './product-documents.component.html',
    styleUrls: ['./product-documents.component.scss'],
})
export class ProductDocumentsComponent implements OnInit {
    @Input() productResources!: ProductResources;

    constructor() {}

    ngOnInit() {}

    getFullPath(resourcePath: string): string {
        if (resourcePath && resourcePath.length > 0) {
            const resourcePattern = new RegExp('^/resources');
            if (resourcePath.search(resourcePattern) === 0) {
                return `${ProplusUrls.root}${resourcePath}`;
            }
        }
        return resourcePath;
    }
}
