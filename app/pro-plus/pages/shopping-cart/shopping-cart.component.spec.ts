// import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Address } from './shopping-cart.component';

// import { ShoppingCartComponent } from './shopping-cart.component';

describe('ShoppingCartComponent', () => {
    // let component: ShoppingCartComponent;
    // let fixture: ComponentFixture<ShoppingCartComponent>;

    // beforeEach((async () => {
    //   await TestBed.configureTestingModule({
    //     declarations: [ ShoppingCartComponent ]
    //   })
    //   .compileComponents();
    // }));

    // beforeEach(() => {
    //   fixture = TestBed.createComponent(ShoppingCartComponent);
    //   // component = fixture.componentInstance;
    //   // fixture.detectChanges();
    // });

    it('should create', async () => {
        const r1 = Address.validate(12);
        await expect(r1.success).toBe(false);
        const a1: Address = {
            address1: '',
            address2: '',
            city: '',
            postalCode: '',
            state: '',
        };
        await expect(Address.validate(a1)).toEqual({
            success: false,
            key: 'address1',
            message: 'Length must be greater than 2 characters',
        });

        await expect(2 + 2).toBe(4);
    });
});
