import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import {
    AddressBookResponse,
    AddressBook,
} from '../../model/address-book-response';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { FormDialogComponent } from './form-dialog/form-dialog.component';
import { DeleteAddressDialogComponent } from './delete-address-dialog/delete-address-dialog.component';
import {
    AddressBookInfo,
    AddressBookRequest,
} from '../../model/address-book-request';

@Component({
    selector: 'app-address-book',
    templateUrl: './address-book.component.html',
    styleUrls: ['./address-book.component.scss'],
})
export class AddressBookComponent implements OnInit {
    constructor(
        private readonly _snackBar: MatSnackBar,
        public dialog: MatDialog,
        private readonly userService: UserService
    ) {}
    addressBookList!: AddressBook[];
    isloading = true;
    async ngOnInit() {
        try {
            const response: AddressBookResponse =
                await this.userService.getAddressBook();
            this.addressBookList = response.addressBooks;
            for (const address of this.addressBookList) {
                address.addressBookInfo.phoneNumber = this.addDash(
                    address.addressBookInfo.phoneNumber
                );
            }
        } finally {
            this.isloading = false;
        }
    }
    addDash(phone: string) {
        return (phone = phone.replace(
            /^(\d{3})\-*(\d{3})\-*(\d{4})$/,
            '$1-$2-$3'
        ));
    }

    openDialog() {
        const dialogRef = this.dialog.open(FormDialogComponent, {
            data: {
                nickname: '',
                firstName: '',
                lastName: '',
                address1: '',
                address2: '',
                city: '',
                state: '',
                zip: '',
                country: '',
                phone: '',
                type: 'create',
            },
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            const config = new MatSnackBarConfig();
            config.verticalPosition = 'top';
            config.duration = 10000;
            if (result) {
                const address: AddressBookInfo = {
                    nickName: result.nickname,
                    firstName: result.firstName,
                    lastName: result.lastName,
                    address1: result.address1,
                    address2: result.address2,
                    city: result.city,
                    stateValue: result.state,
                    postalCode: result.zip,
                    countryValue: result.country,
                    phoneNumber: result.phone.replace(/[^0-9]/g, ''),
                };

                if (address) {
                    const response = await this.userService.createAddressBook(
                        address
                    );
                    if (response.success) {
                        this._snackBar.open(
                            `Address Book ${address.nickName} ${address.firstName}
          created Succesfully`,
                            'Close',
                            config
                        );
                        await this.ngOnInit();
                    }
                }
            }
        });
    }

    openDeleteDialog(element: AddressBook) {
        const dialogRef = this.dialog.open(DeleteAddressDialogComponent);
        dialogRef.afterClosed().subscribe(async (result) => {
            const config = new MatSnackBarConfig();
            config.verticalPosition = 'top';
            config.duration = 10000;
            if (result) {
                const response = await this.userService.deleteAddressBook(
                    element.addressBookId
                );
                if (response.success) {
                    this._snackBar.open(
                        `Address Book ${element.addressBookInfo.nickName} ` +
                            `${element.addressBookId} deleted succesfully`,
                        'Close',
                        config
                    );
                    await this.ngOnInit();
                }
            }
        });
    }

    async openDialogEdit(element: AddressBook) {
        const dialogRef = this.dialog.open(FormDialogComponent, {
            data: {
                nickname: element.addressBookInfo.nickName,
                firstName: element.addressBookInfo.firstName,
                lastName: element.addressBookInfo.lastName,
                address1: element.addressBookInfo.address1,
                address2: element.addressBookInfo.address2,
                city: element.addressBookInfo.city,
                state: element.addressBookInfo.stateValue,
                zip: element.addressBookInfo.postalCode,
                country: element.addressBookInfo.countryValue,
                phone: element.addressBookInfo.phoneNumber,
                type: 'update',
            },
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                const config = new MatSnackBarConfig();
                config.verticalPosition = 'top';
                config.duration = 10000;
                const address: AddressBookRequest = {
                    addressBookId: element.addressBookId,
                    addressBookInfo: {
                        nickName: result.nickname,
                        firstName: result.firstName,
                        lastName: result.lastName,
                        address1: result.address1,
                        address2: result.address2,
                        city: result.city,
                        stateValue: result.state,
                        postalCode: result.zip,
                        countryValue: result.country,
                        phoneNumber: result.phone.replace(/[^0-9]/g, ''),
                    },
                };
                const response = await this.userService.updateAddressBook(
                    address
                );
                if (response.success) {
                    this._snackBar.open(
                        `Address Book ` +
                            `${address.addressBookId} updated Succesfully`,
                        'Close',
                        config
                    );
                    await this.ngOnInit();
                }
            }
        });
    }
}
