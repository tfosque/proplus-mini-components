import { TestBed } from '@angular/core/testing';
import { canAccessUserAdmin, UserAdminGuard } from './user-admin.guard';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from '../services/user.service';
import { SessionInfo } from '../services/SessionInfo';

let guard: UserAdminGuard;
let userService: UserService;

fdescribe('UserAdminGuard', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                MatSnackBarModule,
                RouterTestingModule,
            ],
            providers: [
                UserAdminGuard,
                // UserService
            ],
        });
        guard = TestBed.inject(UserAdminGuard);
        userService = TestBed.inject(UserService);
    });

    const mockUser = {
        lastName: 'd',
        officePhoneNumber: null,
        code: null,
        defaultOrganization: 'USER PERMISSION',
        userAccounts: ['280381 (TEST DENVER)'],
        login: 'protest+user-none@becn.digital',
        roleType: 'Site User',
        title: 'd',
        result: null,
        hasPrivateEVAccount: false,
        internalUser: false,
        rewardsEligible: true,
        lastSelectedAccount: {
            addCustomSteel: true,
            cashAccount: false,
            accountName: 'TEST DENVER',
            accountLegacyId: '280381',
            isAccountClosed: false,
            accountViewPrices: true,
            accountEnabled: true,
        },
        registrationDate: '2021-04-16 12:28:00.0000000',
        contactAddress: null,
        email: 'chen.gu@becn.com',
        firstLoggedInDate: '2021-10-22 14:43:40.0000650',
        deliveryTrackingSettings: {
            dtAccount: null,
            allOrders: null,
            phone: '',
            myOrders: {
                requested: null,
                scheduled: null,
                delivered: null,
            },
            email: '',
        },
        mobilePhoneNumber: null,
        cartLineItems: 3,
        subscribeEmailType: {},
        declineNotificationEmail: false,
        defaultOrganizationId: 'org128100057',
        firstName: 'User Admin',
        callBackParam: null,
        profileId: 'user265320107',
        success: false,
        lastPasswordUpdate: '2021-10-22 14:43:40.0000397',
        messageCode: null,
        messages: null,
        message: undefined,
        contactPhoneNumber: '1111111111',
        lastActivity: '2022-04-28 10:38:30.0000839',
        userType: 'Customer',
        accountBranch: {
            division: '11',
            market: '025',
            address: {
                country: '',
                address3: '',
                address2: '4850 LORNA PLACE',
                city: 'COLORADO SPRINGS',
                address1: 'ROOF DEPOT MOUNTAIN',
                postalCode: '80915',
                state: 'CO',
            },
            branchNumber: '181',
            branchPhone: '7148413999',
            companyName: 'WEST DIVISION',
            divisionName: 'MOUNTAIN',
            branchName: 'COLORADO SPRINGS BRANCH',
            company: '10',
            branchRegionId: '33',
        },
    };

    it('should create an instance of user admin guard', () => {
        expect(guard).toBeTruthy();
    });

    it('should return true if the user has logged in', () => {
        userService['setSession'](
            new SessionInfo({ tag: 'loggedIn', user: mockUser })
        );
        expect(userService.isLoggedIn).toBeTruthy();
        expect(userService.lastSelectedAccount).toBeTruthy();
        if (userService.lastSelectedAccount) {
            expect(userService.lastSelectedAccount.accountLegacyId).toEqual(
                '280381'
            );
        }

        expect(canAccessUserAdmin(userService.isLoggedIn, mockUser)).toEqual({
            path: ['error'],
            queryParams: {
                type: 'forbidden',
            },
        });
    });
});
