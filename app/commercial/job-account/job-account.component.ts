import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/pro-plus/services/user.service';
import { CommercialService } from '../services/commercial.service';

@Component({
    selector: 'app-job-account',
    templateUrl: './job-account.component.html',
    styleUrls: ['./job-account.component.scss'],
})
export class JobAccountComponent implements OnInit {
    jobAccounts: any[] = [];
    searchStr = '';
    jobInfo: any;
    job: any;

    constructor(
        private readonly userService: UserService,
        private commerceService: CommercialService
    ) {}

    ngOnInit(): void {
        const alertUser = true;
        this.jobInfo = this.userService.getUserJobs(alertUser).then((j) => {
            return j;
        });
    }
    selectJob(job: any) {
        this.commerceService.setJobAccount(job);
    }
}
