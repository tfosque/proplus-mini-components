// import { TestBed } from '@angular/core/testing';

// import { UserService } from './user.service';
// import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

//  For more information about testing, see the Angular HttpClient Testing in Depth guide
//  URL:  https://www.ng-conf.org/2019/angulars-httpclient-testing-depth/

xdescribe('UserService', () => {
    // let userService: UserService;
    // let backend: HttpTestingController;
    // beforeEach(() => {
    //   TestBed.configureTestingModule({
    //     imports: [
    //       HttpClientTestingModule,
    //     ],
    //     providers: [UserService]
    //   });
    //   userService = TestBed.inject(UserService);
    //   backend = TestBed.inject(HttpTestingController);
    // });
    // // it('getSessionInfo should return a null when the user is not logged in', async (done) => {
    // //   (async function () {
    // //     try {
    // //       expect(userService.isLoggedIn).toBe(false);
    // //       const user = await userService.getSessionInfo();
    // //       expect(user).toBe(null);
    // //       done();
    // //     } catch (error) {
    // //       done.fail(error);
    // //     }
    // //   })();
    // //   backend
    // //     .expectOne(r => {
    // //       console.log('Faking reply for', r.url);
    // //       return matchesPattern(r.url, /getCurrentUserInfo/);
    // //     })
    // //     .flush({}, { status: 401, statusText: 'Unauthorized' });
    // // });
    // // it('getSessionInfo should a valid user when logged in', async (done) => {
    // //   (async function () {
    // //     try {
    // //       const user = await userService.getSessionInfo();
    // //       expect(user).toEqual({
    // //         firstName: 'Steve',
    // //         lastName: 'Goguen'
    // //       });
    // //       const user2 = await userService.getSessionInfo();
    // //       expect(user2).toEqual(user);
    // //       done();
    // //     } catch (error) {
    // //       done.fail(error);
    // //     }
    // //   })();
    // //   backend
    // //     .expectOne(r => {
    // //       console.log('Faking reply for', r.url);
    // //       return matchesPattern(r.url, /getCurrentUserInfo/);
    // //     })
    // //     .flush({
    // //       firstName: 'Steve',
    // //       lastName: 'Goguen'
    // //     });
    // // });
    // it('Should reset the user when logged out', async (done) => {
    //   (async function () {
    //     try {
    //       const user = await userService.logout();
    //       expect(user).toEqual({});
    //       done();
    //     } catch (error) {
    //       done.fail(error);
    //     }
    //   })();
    //   backend
    //     .expectOne(r => {
    //       console.log('Faking reply for', r.url);
    //       return matchesPattern(r.url, /logout/);
    //     })
    //     .flush({});
    // });
    // it('Should be logged in to fetch accounts', async (done) => {
    //   (async function () {
    //     try {
    //       await userService.getAccounts();
    //       done.fail();
    //     } catch (error) {
    //       done();
    //     }
    //   })();
    //   backend
    //     .expectOne(r => {
    //       console.log('Faking reply for', r.url);
    //       return matchesPattern(r.url, /logout/);
    //     })
    //     .flush({});
    // });
    // // it('Should return an account if logged in', async (done) => {
    // //   const expectedResponse: AccountsResponse = { accounts: [] };
    // //   (async function () {
    // //     try {
    // //       userService.setSessionInfo({
    // //         profileId: '1',
    // //         firstName: 'Steve',
    // //         lastName: 'Goguen'
    // //       });
    // //       const accounts = await userService.getAccounts();
    // //       expect(accounts).toEqual(expectedResponse);
    // //       done();
    // //     } catch (error) {
    // //       done.fail(error);
    // //     }
    // //   })();
    // //   backend
    // //     .expectOne(r => {
    // //       console.log('Faking reply for', r.url);
    // //       return matchesPattern(r.url, /accounts/);
    // //     })
    // //     .flush(expectedResponse);
    // // });
    // // it('Should check if user is already logged in', async (done) => {
    // //   try {
    // //     const expectedUser = {
    // //       profileId: '1',
    // //       firstName: 'Steve',
    // //       lastName: 'Goguen'
    // //     };
    // //     userService.setSessionInfo(expectedUser);
    // //     const userLogged = await userService.doLogin('steve', 'kdkdk');
    // //     expect(userLogged).toEqual(expectedUser);
    // //     done();
    // //   } catch (error) {
    // //     done.fail(error);
    // //   }
    // // });
    // it('Should check if user isnt logged in that the user gets logged in', async (done) => {
    //   (async function () {
    //     try {
    //       const expectedUser = {
    //         profileId: '1',
    //         firstName: 'Steve',
    //         lastName: 'Goguen'
    //       };
    //       const userLogged = await userService.doLogin('steve', 'kdkdk');
    //       expect(userLogged).toEqual(expectedUser);
    //       done();
    //     } catch (error) {
    //       done.fail(error);
    //     }
    //   })();
    //   backend
    //     .expectOne(r => {
    //       console.log('Faking reply for', r.url);
    //       return matchesPattern(r.url, /login/);
    //     })
    //     .flush({
    //       messageInfo: {
    //         profileId: '1',
    //         firstName: 'Steve',
    //         lastName: 'Goguen'
    //       }
    //     });
    // });
});
// function matchesPattern(url: string, regex: RegExp): boolean {
//   const matchResult = url.match(regex);
//   if (!matchResult) { return false; }
//   return matchResult.length > 0;
// }
