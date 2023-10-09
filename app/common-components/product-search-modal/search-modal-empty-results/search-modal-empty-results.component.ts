import { Component, OnInit } from '@angular/core';
import { ProductsService } from 'src/app/pro-plus/services/products.service';

@Component( {
  selector: 'app-search-modal-empty-results',
  templateUrl: './search-modal-empty-results.component.html',
  styleUrls: ['./search-modal-empty-results.component.scss']
} )
export class SearchModalEmptyResultsComponent implements OnInit {

  constructor(
    private readonly productService: ProductsService
  ) { }

  ngOnInit(): void {
  }

  searchAgain() {
    this.productService.resetSearch();
  }

}
