import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ProductsService } from 'src/app/pro-plus/services/products.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { SearchModalService } from 'src/app/pro-plus/services/search-modal.service';
import { BehaviorSubject } from 'rxjs';

@Component( {
  selector: 'app-search-pagination',
  templateUrl: './search-pagination.component.html',
  styleUrls: ['./search-pagination.component.scss']
} )
export class SearchPaginationComponent implements OnInit {
  @ViewChild( MatPaginator, { static: false } ) paginator!: MatPaginator;
  @Input() page = new BehaviorSubject<any>( {} );
  @Input() pagination = new BehaviorSubject<any>( {} );
  @Input() disablePagination = false;

  totalRecords$ = 0;
  productDetails: any = {};
  pageNo = 0;
  pageSize = 20;
  pageSizeOptions = [20];
  searchStr$ = '';

  constructor(
    private readonly productsService: ProductsService,
    private readonly searchModalService: SearchModalService
  ) { }

  ngOnInit(): void {
    this.searchModalService.pagination$.subscribe( paginator => {
      this.totalRecords$ = paginator.totalRecords;
      this.pageNo = paginator.pageNo;
    } )
  }
  nextPage( str: string, pageEvent: PageEvent ) {
    this.productsService.nextPageWithCateFilter( str, pageEvent );
  };

}
