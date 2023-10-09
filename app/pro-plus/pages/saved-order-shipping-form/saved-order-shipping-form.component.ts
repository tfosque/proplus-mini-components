import { Component } from '@angular/core';
import { ShippingFormComponent } from '../checkout/shipping-form/shipping-form.component';
import { UserService } from '../../services/user.service';
import { ShoppingCartService } from '../../services/shopping-cart-service';
import { LocationsService } from '../../../services/locations.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SavedOrdersService } from '../../services/saved-orders.service';
import { UserNotifierService } from '../../../common-components/services/user-notifier.service';
import { AnalyticsService } from '../../../common-components/services/analytics.service';
import { createShippingStore } from '../../stores/shipping-info-store';
import { InstantAddressApiService } from '../../services/instant-address-api.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-saved-order-shipping-form',
    templateUrl: '../checkout/shipping-form/shipping-form.component.html',
    // templateUrl: './saved-order-shipping-form.component.html',
    styleUrls: ['../checkout/shipping-form/shipping-form.component.scss'],
    // styleUrls: ['./saved-order-shipping-form.component.scss'],
})
export class SavedOrderShippingFormComponent extends ShippingFormComponent {
    constructor(
        userService: UserService,
        cartService: ShoppingCartService,
        locationsService: LocationsService,
        router: Router,
        route: ActivatedRoute,
        savedOrderService: SavedOrdersService,
        userNotifier: UserNotifierService,
        analyticsService: AnalyticsService,
        instantAddressApiService: InstantAddressApiService,
        addressValidationDialog: MatDialog
    ) {
        super(
            userService,
            cartService,
            locationsService,
            router,
            route,
            savedOrderService,
            userNotifier,
            analyticsService,
            instantAddressApiService,
            addressValidationDialog
        );
    }

    public getShippingStore() {
        // console.log(`Create a unique shipping store because we are in saved order`);
        return createShippingStore();
    }
}
