import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/pro-plus/services/user.service';

@Component({
    selector: 'app-underlayment-vapor-barrier',
    templateUrl: './underlayment-vapor-barrier.component.html',
    styleUrls: ['./underlayment-vapor-barrier.component.scss'],
})
export class UnderlaymentVaporBarrierComponent implements OnInit {
    req: any = {};
    constructor(private userService: UserService) {}

    ngOnInit(): void {
        const user = this.userService.accountId;
        if (user) {
            console.log(user, 'user');
            this.req = {
                accountId: user,
                filter: '2136009171,4294791971',
            };
        }
    }
}
