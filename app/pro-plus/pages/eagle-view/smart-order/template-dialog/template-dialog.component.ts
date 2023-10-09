import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { TemplatesService } from '../../../../services/templates.service';
import { UserService } from '../../../../services/user.service';
import { TemplateReference } from '../../../../model/template-list';
import { tap } from 'rxjs/operators';
import { TemplateItemsComponent } from './template-items/template-items.component';

@Component({
  selector: 'app-template-dialog',
  templateUrl: './template-dialog.component.html',
  styleUrls: ['./template-dialog.component.scss']
})
export class TemplateDialogComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

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
  currentTemplateId = '';

  get accountId() {
    if (this.userService.accountIdInString) {
        return this.userService.accountIdInString;
    } else {
        return null;
    }
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly templateService: TemplatesService,
    private readonly _snackBar: MatSnackBar,
    private readonly userService: UserService,
    public dialog: MatDialog,
    public readonly dialogRef: MatDialogRef<TemplateDialogComponent>,
  ) { }

  async ngOnInit() {
    await this.loadTemplates();
    this.selection.isSelected = this.isChecked.bind(this);
    this.currentTemplateId = this.data.templateId;
  }

  ngAfterViewInit() {
    this.paginator.page
      .pipe(tap(() => this.loadTemplates()))
      .subscribe();
  }

  async loadTemplates() {
    const account = '';
    const pageNo = this.paginator?.pageIndex;
    const pageSize = this.paginator?.pageSize;
    const templateResponse = await this.templateService.getTemplatesV1(
      account,
      pageNo,
      pageSize,
    );
    // console.log('template response: ', templateResponse);
    if (templateResponse) {
      this.dataSource = templateResponse.templates || [];
      this.templateCount = templateResponse.totalNumRecs || 0;
    }
  }

  isChecked(row: TemplateReference): boolean {
    const found = this.selection.selected.find(el => el.templateId === row.templateId);
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
    const templateDetailResponse = await this.templateService.getTemplateDetail(
      templateId,
      this.accountId || ''
    );
    if (templateDetailResponse && templateDetailResponse.result.templateItems.length > 0) {
      const dialogRef = this.dialog.open(TemplateItemsComponent, {
        width: '800px',
        height: '90vh',
        data: {
          templateName: templateDetailResponse.result.templateName,
          templateItems: templateDetailResponse.result.templateItems
        }
      });
      return dialogRef.afterClosed().toPromise()
        .then(async result => {
            if (result) {
              // Create smart order based on this template
              // await this.createSmartOrderFromTemplate(templateDetailResponse.result.templateId);
              console.log('result from template items dialog: ', result);
              this.dialogRef.close(templateDetailResponse.result.templateId);
            }
        });
    } else {
      this.showSnack('This template doesn\'t have any items in it', 'close');
    }
  }

  async createSmartOrder() {
    if (!this.selection.hasValue()) {
      this.showSnack('Please select a template to create smart order.', 'close');
      return;
    }
    
  }
}
