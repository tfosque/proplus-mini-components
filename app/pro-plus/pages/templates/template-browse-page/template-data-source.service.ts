import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TemplateReference } from '../../../model/template-list';
import { TemplateListResponse } from '../../../model/template-list-response';
import { TemplatesService } from '../../../services/templates.service';

export class TemplateDataSource implements DataSource<TemplateReference> {
    public templateResponses = new BehaviorSubject<TemplateListResponse | null>(
        null
    );
    public get templates$() {
        return this.templateResponses.pipe(
            map((r) => (r ? r.result.templates || [] : []))
        );
    }
    constructor(private readonly templateService: TemplatesService) {}

    connect(
        collectionViewer: CollectionViewer
    ): Observable<TemplateReference[]> {
        return this.templates$;
    }
    disconnect(collectionViewer: CollectionViewer): void {
        this.templateResponses.complete();
    }

    async loadTemplates(
        account: string | number,
        pageNo: number,
        pageSize: number,
        filterBy: string,
        filter: string,
        orderByField: string,
        orderByDirection: string
    ) {
        if (orderByField === 'dataLastModified' && !orderByDirection) {
            orderByDirection = 'desc';
        }
        const templateResponse = await this.templateService.getTemplatesForDataSource(
            account,
            pageNo,
            pageSize,
            filterBy,
            filter,
            orderByField,
            orderByDirection
        );
        this.templateResponses.next(templateResponse);
    }
}
