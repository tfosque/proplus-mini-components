import {
    AfterViewInit,
    Component,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { TemplatesService } from '../../../services/templates.service';
import { TemplateReference } from '../../../model/template-list';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { tap } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { EagleViewService } from '../../../services/eagle-view.service';
import { EditEVOrderRequest } from '../../../model/eagle-view-smart-order';
import { UserService } from '../../../services/user.service';
import {
    ConfirmationProduct,
    ConfirmAvailableProductsComponent,
    ProductConfirmationConfig,
} from '../../../shared-components/confirm-available-products/confirm-available-products.component';

@Component({
    selector: 'app-template-selection',
    templateUrl: './template-selection.component.html',
    styleUrls: ['./template-selection.component.scss'],
})
export class TemplateSelectionComponent implements OnInit, AfterViewInit {
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild('templatePreview') templatePreview?: TemplateRef<any>;

    dataSource: TemplateReference[] = [];
    displayedColumns: string[] = [
        'select',
        'templateName',
        'lastModifiedDate',
        'accountName',
        'createdByUser.lastName',
    ];
    templateCount = 0;
    selection = new SelectionModel<TemplateReference>(false, []);
    evOrderId = '';

    get accountId() {
        if (this.userService.accountIdInString) {
            return this.userService.accountIdInString;
        } else {
            return null;
        }
    }

    constructor(
        private readonly route: ActivatedRoute,
        private readonly templateService: TemplatesService,
        private readonly _snackBar: MatSnackBar,
        private readonly eagleViewService: EagleViewService,
        private readonly router: Router,
        private readonly userService: UserService,
        public dialog: MatDialog,
        public availabilityDialog: MatDialog
    ) {}

    async ngOnInit() {
        const p: ParamMap = this.route.snapshot.paramMap;
        const evOrderId: string = p.get('evOrderId') || '';
        if (!evOrderId) {
            throw new Error('Invalid EagleView order id');
        }
        this.evOrderId = evOrderId;
        // console.log('ev Order id: ', evOrderId);
        await this.loadTemplates();
        this.selection.isSelected = this.isChecked.bind(this);
    }

    async loadTemplates() {
        const account = '';
        const pageNo = this.paginator?.pageIndex;
        const pageSize = this.paginator?.pageSize;
        const templateResponse = await this.templateService.getTemplatesV1(
            account,
            pageNo,
            pageSize
        );
        // console.log('template response: ', templateResponse);
        if (templateResponse) {
            this.dataSource = templateResponse.templates || [];
            this.templateCount = templateResponse.totalNumRecs || 0;
        }
    }

    ngAfterViewInit() {
        this.paginator.page.pipe(tap(() => this.loadTemplates())).subscribe();
    }
    goBack() {
        this.router.navigateByUrl('/proplus/eagle-view/landing');
    }

    async createSmartOrder() {
        if (!this.selection.hasValue()) {
            this.showSnack(
                'Please select a template to create smart order.',
                'close'
            );
            return;
        }
        await this.createSmartOrderFromTemplate(
            this.selection.selected[0].templateId
        );
    }

    public getProdUrl(productId?: string, itemNumber?: string) {
        if (productId && itemNumber) {
            return ['/productDetail', productId, itemNumber];
        }
        if (productId) {
            return ['/productDetail', productId];
        }
        return [];
    }

    async createSmartOrderFromTemplate(templateId: string) {
        const editEVOrderRequest: EditEVOrderRequest = {
            evOrderId: this.evOrderId,
            templateId: templateId,
            baseWasteFactor: 10,
        };
        const editEVOrderResponse = await this.eagleViewService.editEVOrder(
            editEVOrderRequest
        );
        if (editEVOrderResponse.success) {
            if (editEVOrderResponse.messages) {
                const messages = editEVOrderResponse.messages;
                // this.showSnack(messages[0].value, 'close', 5000);
                const message = messages[0].value;
                const matches = message.match(
                    /item\(s\)\s([0-9,]+)\shave been.+item\(s\)\s([0-9,]+)\sare unavailable/
                );
                if (matches) {
                    const availableItemIds = matches[1].split(',');
                    const unavailableItemIds = matches[2].split(',');
                    const templateDetailResponse =
                        await this.templateService.getTemplateDetail(
                            templateId,
                            this.accountId || ''
                        );
                    if (
                        templateDetailResponse &&
                        templateDetailResponse.result.templateItems.length > 0
                    ) {
                        const templateItems =
                            templateDetailResponse.result.templateItems;
                        const availableItems: ConfirmationProduct[] =
                            templateItems
                                .filter((item) =>
                                    availableItemIds.includes(item.itemNumber)
                                )
                                .map((i) => {
                                    return {
                                        name: i.itemOrProductDescription || '',
                                        productId: i.productOrItemNumber || '',
                                        itemNumber: i.itemNumber,
                                        prodUrl: this.getProdUrl(
                                            i.productOrItemNumber,
                                            i.itemNumber
                                        ),
                                        productImageUrl: i.productImageUrl,
                                    };
                                });
                        const unavailableItems: ConfirmationProduct[] =
                            templateItems
                                .filter((item) =>
                                    unavailableItemIds.includes(item.itemNumber)
                                )
                                .map((i) => {
                                    return {
                                        name: i.itemOrProductDescription || '',
                                        productId: i.productOrItemNumber || '',
                                        itemNumber: i.itemNumber,
                                        prodUrl: this.getProdUrl(
                                            i.productOrItemNumber,
                                            i.itemNumber
                                        ),
                                        productImageUrl: i.productImageUrl,
                                    };
                                });
                        const config: ProductConfirmationConfig = {
                            unavailableLineItems: unavailableItems,
                            availableLineItems: availableItems,
                            unavailableSkuList: unavailableItemIds,
                            cartOrTemplate: 'EagleView Order',
                            whenUserSaysOk: (ItemToAdd) => {
                                this.router.navigate([
                                    `/proplus/eagle-view/smart-order/${this.evOrderId}`,
                                ]);
                            },
                        };
                        const dialogRef = this.availabilityDialog.open(
                            ConfirmAvailableProductsComponent,
                            {
                                data: config,
                            }
                        );
                        dialogRef.afterClosed().subscribe();
                    }
                }
            } else {
                this.router.navigate([
                    `/proplus/eagle-view/smart-order/${this.evOrderId}`,
                ]);
            }
        } else {
            if (editEVOrderResponse.messages) {
                const message = editEVOrderResponse.messages[0];
                this.showSnack(message.value, 'close');
            }
        }
    }

    isChecked(row: TemplateReference): boolean {
        const found = this.selection.selected.find(
            (el) => el.templateId === row.templateId
        );
        if (found) {
            return true;
        }
        return false;
    }

    showSnack(
        message: string,
        title: string = 'Close',
        duration: number = 3000
    ) {
        const config = new MatSnackBarConfig();
        config.verticalPosition = 'top';
        config.duration = duration;
        this._snackBar.open(message, title, config);
    }

    async openTemplateDialog(templateId: string) {
        if (!this.templatePreview) {
            return;
        }
        const templateDetailResponse =
            await this.templateService.getTemplateDetail(
                templateId,
                this.accountId || ''
            );
        if (
            templateDetailResponse &&
            templateDetailResponse.result.templateItems.length > 0
        ) {
            const dialogRef = this.dialog.open(this.templatePreview, {
                width: '800px',
                height: '90vh',
                data: {
                    templateName: templateDetailResponse.result.templateName,
                    templateItems: templateDetailResponse.result.templateItems,
                },
            });
            return dialogRef
                .afterClosed()
                .toPromise()
                .then(async (result) => {
                    if (result) {
                        // Create smart order based on this template
                        await this.createSmartOrderFromTemplate(
                            templateDetailResponse.result.templateId
                        );
                    }
                });
        } else {
            this.showSnack(
                "This template doesn't have any items in it",
                'close'
            );
        }
    }
}
