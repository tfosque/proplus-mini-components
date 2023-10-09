import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ContactUsForm } from '../../services/form-submission.service';

@Component({
    selector: 'app-contact-us-form',
    templateUrl: './contact-us-form.component.html',
    styleUrls: ['./contact-us-form.component.scss'],
})
export class ContactUsFormComponent implements OnInit {
    @Input() contactUsConfigValues: any;
    @ViewChild('hiddenContactUsForm')
    hiddenContactUsForm?: ElementRef<any>;
    isSubmitted = false;
    isSubmitting = false;
    success = false;

    // Initialize formControls of contactUsForm.  This is for use the with the reactiveForm angular module.
    contactUsForm = new FormGroup({
        firstName: new FormControl('', [Validators.required]),
        lastName: new FormControl('', [Validators.required]),
        company: new FormControl('', []),
        role: new FormControl('', []),
        zip: new FormControl('', []),
        phone: new FormControl('', [Validators.required]),
        emailAddress: new FormControl('', [
            Validators.required,
            Validators.email,
        ]),
        preferredContactMethod: new FormControl('phone', [Validators.required]),
        businessEmailAddress: new FormControl('', [Validators.required]),
        questions: new FormControl('', []),
        cmsContactUsDocument: new FormControl('contact-us/contact-us-config'),
    });

    contactMethods: string[] = [];

    requiredText!: string;
    firstNameLabel!: string;
    firstNameRequiredErrorMessage!: string;
    lastNameLabel!: string;
    lastNameRequiredErrorMessage!: string;
    companyLabel!: string;
    roleLabel!: string;
    zipCodeLabel!: string;
    phoneLabel!: string;
    phoneRequiredErrorMessage!: string;
    emailLabel!: string;
    emailRequiredErrorMessage!: string;
    emailInvalidErrorMessage!: string;
    preferredContactLabel!: string;
    subjectLabel!: string;
    questionLabel!: string;
    submitText!: string;
    clearFormText!: string;
    subjectOptions!: {
        value: string;
        key: string;
    }[];
    successRedirect!: string;

    constructor() {}

    ngOnInit() {
        // Set all data pulled from the cms.
        this.requiredText = this.contactUsConfigValues.requiredText;
        this.firstNameLabel = this.contactUsConfigValues.firstName.label;
        this.firstNameRequiredErrorMessage =
            this.contactUsConfigValues.firstName.requiredError;
        this.lastNameLabel = this.contactUsConfigValues.lastName.label;
        this.lastNameRequiredErrorMessage =
            this.contactUsConfigValues.lastName.requiredError;
        this.companyLabel = this.contactUsConfigValues.company.label;
        this.roleLabel = this.contactUsConfigValues.role.label;
        this.zipCodeLabel = this.contactUsConfigValues.zipCode.label;
        this.phoneLabel = this.contactUsConfigValues.phone.label;
        this.phoneRequiredErrorMessage =
            this.contactUsConfigValues.phone.requiredError;
        this.emailLabel = this.contactUsConfigValues.emailAddress.label;
        this.emailRequiredErrorMessage =
            this.contactUsConfigValues.emailAddress.requiredError;
        this.emailInvalidErrorMessage =
            this.contactUsConfigValues.emailAddress.invalidError;
        this.preferredContactLabel =
            this.contactUsConfigValues.preferredContact.label;
        this.subjectLabel = this.contactUsConfigValues.subject.label;
        this.questionLabel = this.contactUsConfigValues.questions.label;
        this.submitText = this.contactUsConfigValues.submitText;
        this.clearFormText = this.contactUsConfigValues.clearFormText;
        this.contactMethods[0] = this.contactUsConfigValues.phoneText;
        this.contactMethods[1] = this.contactUsConfigValues.emailText;
        this.subjectOptions = this.contactUsConfigValues.subjectOptions;
        this.successRedirect = this.contactUsConfigValues.successRedirect;
    }

    /**
     * submit form action
     */
    async onSubmit() {
        this.isSubmitted = true;

        if (this.contactUsForm.valid && !this.isSubmitting) {
            this.isSubmitting = true;
            const subjectEmail = this.contactUsForm.value.businessEmailAddress;
            const subject = this.subjectOptions.find(
                (curOpt) => curOpt.value === subjectEmail
            );
            if (!subject) {
                throw new Error('Subject is null');
            }
            const subjectTitle = subject.key;
            const formSubmission = {
                ...this.contactUsForm.value,
                subject: subjectTitle,
            };

            const validation = ContactUsForm.validate(formSubmission);

            if (validation.success) {
                if (
                    !this.hiddenContactUsForm ||
                    !this.hiddenContactUsForm.nativeElement
                ) {
                    console.log('oh hell, null', this.hiddenContactUsForm);
                    return;
                }
                console.log(
                    'HIDDEN FORM',
                    this.hiddenContactUsForm.nativeElement
                );
                const form = this.hiddenContactUsForm.nativeElement as any;
                form['firstName'].value = this.contactUsForm.value.firstName;
                form['lastName'].value = this.contactUsForm.value.lastName;
                form['company'].value = this.contactUsForm.value.company;
                form['role'].value = this.contactUsForm.value.role;
                form['zip'].value = this.contactUsForm.value.zip;
                form['phone'].value = this.contactUsForm.value.phone;
                form['emailAddress'].value =
                    this.contactUsForm.value.emailAddress;
                form['preferredContactMethod'].value =
                    this.contactUsForm.value.preferredContactMethod;
                form['subject'].value = subjectTitle;
                form['questions'].value = this.contactUsForm.value.questions;
                console.log('HIDDEN FORM', this.hiddenContactUsForm);
                form.submit();
            } else {
                console.error({ validation });
            }
        }
    }

    /**
     * simple form reset function.  Clears all values.
     */
    resetForm(): void {
        this.contactUsForm.reset();
        this.isSubmitted = false;
        this.success = false;
    }
}
