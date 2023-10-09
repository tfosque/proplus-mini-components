import {
    Component,
    EventEmitter,
    Output,
    Input,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { Product } from '../../../api-response-interfaces/product';
import { MatDialog } from '@angular/material/dialog';
import { ProductAllComponent } from '../product-all/product-all.component';
import { DialogDataAll } from '../../pages/templates/template-detail-page/template-detail-page.component';
import { Sku } from '../../services/products.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';

type SkuSelection = { quantity: number; sku: Sku; uom: string };

@Component({
    selector: 'app-product-selector',
    templateUrl: './product-selector.component.html',
    styleUrls: ['./product-selector.component.scss'],
})
export class ProductSelectorComponent implements OnInit, OnDestroy {
    @Input() public accountId?: string;
    @Output()
    public productAdded: EventEmitter<SkuSelection> = new EventEmitter<SkuSelection>();
    isLargeScreen = false;
    layoutChangesLargeSub!: Subscription;

    get isAccountClosed() {
        return this.userService.isLastSelectedAccountClosed;
    }

    constructor(
        public dialog: MatDialog,
        public dialogAll: MatDialog,
        private readonly breakpointObserver: BreakpointObserver,
        private readonly userService: UserService
    ) {}

    async ngOnInit() {
        this.layoutChangesLargeSub = this.breakpointObserver
            .observe([Breakpoints.Large])
            .subscribe((result) => {
                this.isLargeScreen = result.matches ? true : false;
            });
    }

    ngOnDestroy() {
        this.layoutChangesLargeSub.unsubscribe();
    }

    public displayFn(prod?: Product): string | undefined {
        return prod ? prod.productName : undefined;
    }

    public searchAll(searchTerm: string): void {
        const data: DialogDataAll = {
            accountId: this.accountId || '0',
            searchTerm: searchTerm,
            productId: '',
        };

        const maxWidth = this.isLargeScreen ? '1000px' : '95vw';

        const dialogAllRef = this.dialogAll.open(ProductAllComponent, {
            data: data,
            width: '95vw',
            maxWidth: maxWidth,
        });

        dialogAllRef.afterClosed().subscribe((result: SkuSelection) => {
            if (!result) {
                return;
            }
            this.productAdded.emit(result);
        });
    }
}
