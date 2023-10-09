import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { UserService } from '../pro-plus/services/user.service';

@Pipe({
    name: 'price',
})
export class PricePipe implements PipeTransform {
    constructor(
        readonly currencyPipe: CurrencyPipe,
        readonly userService: UserService
    ) {}
    transform(value: any, unitOfMeasure?: string, fromOrderDetail = false): string {
        const hasPricing = this.userService.permissions.price;
        const isAccountClosed = this.userService.isLastSelectedAccountClosed;
        //  Only show the unit if we don't have access to pricing
        if (isAccountClosed) return '';
        if(!hasPricing && unitOfMeasure && !fromOrderDetail) {
            return unitOfMeasure;
        } else if (!hasPricing) {
            return 'Price calculated at invoicing';
        } else if (typeof value === 'number') {
            if (value === 0) {
                return 'Price calculated at invoicing';
            } else {
                if (unitOfMeasure && unitOfMeasure.length > 0) {
                    return `${this.currencyPipe.transform(
                        value
                    )} / ${unitOfMeasure}`;
                } else {
                    return `${this.currencyPipe.transform(value)}`;
                }
            }
        } else if (value === '') {
            return 'Price calculated at invoicing';
        } else if (value) {
            if (unitOfMeasure && unitOfMeasure.length > 0) {
                return `${this.currencyPipe.transform(
                    value
                )} / ${unitOfMeasure}`;
            } else {
                return `${this.currencyPipe.transform(value)}`;
            }
        } else {
            return 'Price calculated at invoicing';
        }
    }
}
