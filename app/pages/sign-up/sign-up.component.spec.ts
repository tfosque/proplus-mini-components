// import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignUpComponent } from './sign-up.component';

// replace xdescribe with either describe or fdescribe
//   fdescribe - Focus on this test
//   describe - Normal test
//   xdescribe - Exclude test
xdescribe('SignUpComponent', () => {
    let component: SignUpComponent;
    // let fixture: ComponentFixture<SignUpComponent>;

    // beforeEach(async(() => {
    //   TestBed.configureTestingModule({
    //     declarations: [ SignUpComponent ]
    //   })
    //   .compileComponents();
    // }));

    // beforeEach(() => {
    //   fixture = TestBed.createComponent(SignUpComponent);
    //   component = fixture.componentInstance;
    //   fixture.detectChanges();
    // });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

// const contactSupport = {}
