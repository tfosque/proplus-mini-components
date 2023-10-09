import { ProPlusApiBase } from './pro-plus-api-base.service';
import {get} from 'lodash';
import {BehaviorSubject, combineLatest, from, Observable, of} from 'rxjs';
import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import {
    GetOrderApprovalListRequest,
    SavedOrdersService,
} from './saved-orders.service';
import {map, skipWhile, switchMap, tap} from 'rxjs/operators';
import {AllPermissions} from "src/app/pro-plus/services/UserPermissions";

const userBaseCreds: PendingOrdersUserCredentials = {
  accountId: '0',
  isLoggedIn: false,
  approver: false,
  approverId: '',
}

const baseRequestBody: Partial<GetOrderApprovalListRequest> = {
  approverId: '', // required
  currentPage: 1,
  pageSize: 100,
  status: 'READY_FOR_APPROVAL',
  sortBy: 'submittedDate',
  sortType: undefined,
  searchBy: '',
  searchTerm: '',
};

@Injectable({
    providedIn: 'root',
})
export class PendingOrdersService {
    private readonly pendingOrdersCnt = new BehaviorSubject<number>(0);
    public pendingOrdersCnt$ = this.pendingOrdersCnt.asObservable();

    private readonly user: BehaviorSubject<PendingOrdersUserCredentials> = new BehaviorSubject<PendingOrdersUserCredentials>(userBaseCreds);

    constructor(
        public readonly userService: UserService,
        private readonly api: ProPlusApiBase,
        private readonly savedOrderService: SavedOrdersService
    ) {}

    async checkApproverStatus() {
        await this.getUserOrderCredentials();
        await this.getApproverPermissions();
    }

  // START: UPDATED FUNCTIONALITY FOR GETTING USER AND ORDER INFO (Joe A)
  // was running into race conditions with the way some information is being exposed through getters
  // I used the existing logic for these functions and observablles

  /** Get User Session
   * @summary return the user session info
   */
  public getUserOrderCredentials$ = this.api.userSession
      .pipe(
        skipWhile((user) => !Boolean(user.permissions)),
        map((session) => session)
      );

  /** Get User Permission(s)
   * @summary return all user permissions or, if a path is provided, return a specific permission
   * @param path - string (parsed using lodash [get])
   */
  public getApproverPermissions$(path: string | null = null) : Observable<AllPermissions | string | undefined> {
    return from(this.userService.getCurrentUserPermission()).pipe(
    map((permissions) => !!path ? get(permissions, path) : permissions))
  };

  public isSubmitForApprover$: Observable<any> = this.getApproverPermissions$('order.submitForApproval');

  public isApprover$: Observable<any> = this.getApproverPermissions$('order.approve');

  /** USER INFO
   * @summary combines getUserOrderCredentials$ and isApprover$ into a single observable containing updated user info..
   */
  public userInfo$ = combineLatest([this.getUserOrderCredentials$, this.isApprover$]).pipe(
    map(([session, isApprover]) => {
      return {
        ...userBaseCreds,
        approver: isApprover,
        accountId: String(session.accountId),
        isLoggedIn: session.isLoggedIn,
        approverId: session.profileId,
      }

    })
  )

  /** GET PENDING ORDERS COUNT
   * @param isLoggedIn
   * @summary returns a pipe that returns the getOrderApprovalList observable with results based on userInfo$.
   * As long as the user is logged in and is an approver, the pending order count will be returned
   */
  public getPendingOrdersCount$(isLoggedIn: boolean): Observable<number> {
    return this.userInfo$.pipe(
      switchMap(({approver}) => {
        if(!approver || !isLoggedIn) {
          return of(0)
        }
        return this.savedOrderService.getOrderApprovalList(baseRequestBody).pipe(
          map((list) => list?.result?.pagination?.totalCount || 0),
          tap(() => {
            this.savedOrderService.getOrderApprovalList(baseRequestBody)
          })
        )
      })
    )
  }

  // END: UPDATED FUNCTIONALITY FOR GETTING USER AND ORDER INFO (Joe)

  public async getApproverPermissions() {
    // tslint:disable-next-line: no-floating-promises
    await this.userService
      .getCurrentUserPermission()
      .then((res) => res)
      .then((permissions) => {
        if (!permissions) {
          return;
        }
        const nextUsrInfo = {
          ...this.user.getValue(),
          approver: permissions.order.approve,
        };
        this.user.next(nextUsrInfo);
      });
  }

  public async getUserOrderCredentials() {
    // get and set user info from sessionInfo
    this.api.userSession
      .pipe(skipWhile((user) => !Boolean(user.permissions)))
      .subscribe((session) => {
        this.user.next({
          accountId: String(session.accountId),
          isLoggedIn: session.isLoggedIn,
          // approver: this.isApprover.getValue(), // TODO not updating?
          approverId: session.profileId,
        });
      });
  }
    public async getPendingOrders() {
        // call approverlist and get profileId from approver
        const id = this.user.getValue().approverId;

        if (id) {
            this.savedOrderService
                .getOrderApprovalList(baseRequestBody)
                .subscribe((list) => {
                    if (list && list.result && list.result.pagination) {
                        console.log({ list });
                        this.pendingOrdersCnt.next(
                            list.result.pagination.totalCount
                        );
                    }
                });
            this.savedOrderService.getOrderApprovalList(baseRequestBody);
        }
    }

    hideBar() {
        this.pendingOrdersCnt.next(0);
    }
    public async resetOrdersApproverInfo() {
        this.pendingOrdersCnt.next(0);
        this.user.next({
            accountId: '',
            isLoggedIn: false,
            approver: false,
            approverId: '',
        });
    }
}
export interface PendingOrdersUserCredentials {
    accountId: string;
    isLoggedIn: boolean;
    approver?: boolean;
    approverId?: string | null;
}
