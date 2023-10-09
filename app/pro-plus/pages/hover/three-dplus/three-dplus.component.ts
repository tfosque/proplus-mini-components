import { Component, OnInit } from '@angular/core';
import { SMSService } from '../../../services/sms-service';

@Component({
    selector: 'app-three-dplus',
    templateUrl: './three-dplus.component.html',
    styleUrls: ['./three-dplus.component.scss'],
})
export class ThreeDplusComponent implements OnInit {
    downloadApp = false;
    smsMessageSuccess = false;
    smsMessage = '';
    phoneNumber = '';

    constructor(private readonly smsService: SMSService) {}

    ngOnInit() {}

    videoClick() {
        var win = window.open();
        if (!win) {
            return;
        }
        win.document.write(
            '<iframe width="1519" height="854" src="https://www.youtube.com/embed/0Ljl5Y4fwFY" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
        );
    }

    async getLink() {
        this.downloadApp = true;
        if (this.phoneNumber) {
            const phonePattern = /^[(]{0,1}[0-9]{3}[)]{0,1}[-\s]{0,1}[0-9]{3}[-\s]{0,1}[0-9]{4}$/g;
            if (phonePattern.test(this.phoneNumber)) {
                const formattedPhone = this.formatPhoneForApi(this.phoneNumber);
                const response = await this.smsService.downloadBeacon3DplusApp(
                    formattedPhone
                );
                if (response) {
                    if (response.success) {
                        this.smsMessageSuccess = true;
                        this.smsMessage = response.messages[0].value;
                    } else {
                        this.smsMessageSuccess = false;
                        this.smsMessage = response.messages[0].value;
                    }
                } else {
                    this.smsMessageSuccess = false;
                    this.smsMessage = 'Error transmitting SMS service';
                }
            } else {
                this.smsMessageSuccess = false;
                this.smsMessage = 'Invalid phone number';
            }
        } else {
            this.smsMessageSuccess = false;
            this.smsMessage = 'Invalid phone number';
        }
    }

    formatPhoneForApi(phone: string) {
        if (phone && phone.length > 0) {
            phone =
                '1' +
                phone.replace(
                    /^\(?([0-9]{3})\)?[- ]?([0-9]{3})[- ]?([0-9]{4})$/,
                    '$1$2$3'
                );
        }
        return phone;
    }
}
