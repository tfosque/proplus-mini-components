export interface JobResponse {
    message: string;
    hasJobAccount: boolean;
    hasJobNumber: boolean;
    isJobAccountRequired: boolean;
    jobs: Job[];
}

interface Job {
    jobName: string;
    jobNumber: string;
}
