import { Job } from '../../model/job';
import {
    SubmitCurrentOrderRequest,
    GetCurrentOrderReviewResponse,
} from '../../services/shopping-cart-service';
import { storeOf } from '../../stores/store';
import { ShippingAddress, ContactInfo } from '../../services/GetOrderApprovalDetailResponse';
import { Errors } from './order-review.component';
import { SavedOrderReviewInfoResponse } from '../../services/SavedOrderReviewInfoResponse';
import { formatDate } from '@angular/common';

interface OrderReview {
    currentDate: string | null;
    displayName: string | null;
    currentOrderReview?: GetCurrentOrderReviewResponse;
    shippingMethod: string | null;
    deliveryOption: string | null;
    deliveryDate: string | null;
    deliveryTime: string | null;
    shippingAddress: ShippingAddress | null;
    contactInfo?: ContactInfo | null;
    instructions: string | null;
    PO: string | null;
    poRequired: boolean;
    jobNumber: string | null;
    jobNumberRequired: boolean;
    showJobNumber: boolean;
    jobName: string | null;
    jobNameRequired: boolean;
    showJobName: boolean;
    selectedJob: Job | null;
    jobs: Job[];
    additionalRecipients: { email: string }[];
}
export function createOrderReviewStore() {
    const initialState: OrderReview = {
        currentDate: null,
        additionalRecipients: [],
        selectedJob: null,
        jobs: [],
        jobNameRequired: false,
        jobNumberRequired: false,
        poRequired: false,
        showJobName: false,
        showJobNumber: false,
        jobNumber: null,
        jobName: null,
        PO: null,
        deliveryDate: null,
        deliveryOption: null,
        deliveryTime: null,
        instructions: null,
        shippingAddress: null,
        contactInfo: null,
        shippingMethod: null,
        displayName: null,
    };
    return storeOf<OrderReview>( initialState )
        .createStore( {
            setSelectedJob( s, job: Job | null ) {
                return {
                    ...s,
                    selectedJob: job || null,
                    jobName: ( job && job.jobName ) || null,
                    jobNumber: ( job && job.jobNumber ) || null,
                };
            },

            addEmail( s, _address: string ) {
                if ( s.additionalRecipients.length < 3 ) {
                    s.additionalRecipients.push( { email: '' } );
                }

                return s;
            },
            deleteEmail( s, index: number ) {
                s.additionalRecipients.splice( index, 1 );
                return s;
            },

            setPO( s, newPO: string ) {
                return { ...s, PO: newPO };
            },

            setJobName( s, newJobName: string ) {
                return {
                    ...s,
                    selectedJob: null,
                    jobNumber: null,
                    jobName: newJobName || null,
                };
            },

            setSavedOrderReviewResponse(
                s,
                r: SavedOrderReviewInfoResponse | null
            ) {
                if ( !r ) {
                    return s;
                }
                const jobs = ( r.jobAccounts && r.jobAccounts.jobs ) || [];
                const selectedJob = jobs.find( ( j ) => j.selected! ) || null;
                const jobNumberRequired = r.job.jobNumberMandatory;
                const jobNameRequired = r.job.jobNameMandatory;
                const newState: Readonly<OrderReview> = {
                    currentDate: formatDate(
                        new Date(),
                        'MM-dd-yyyy',
                        'en_US'
                    ),

                    displayName: r.displayName,
                    PO: r.po,
                    additionalRecipients: r.emailAddress.map( ( email ) => ( {
                        email,
                    } ) ),
                    deliveryDate: r.deliveryDate,
                    deliveryOption: r.deliveryOptionValue,
                    deliveryTime: r.deliveryTime,
                    instructions: r.instructions,
                    jobName: r.job && r.job.jobName,
                    jobNameRequired: jobNameRequired,
                    jobNumber: r.job.jobNumber,
                    jobNumberRequired: jobNumberRequired,
                    jobs: jobs,
                    poRequired:
                        ( r.requiredFields && r.requiredFields.po ) || false,
                    selectedJob: selectedJob,
                    shippingAddress: r.shippingAddress,
                    contactInfo: r.contactInfo,
                    shippingMethod: r.shippingMethodValue,
                    showJobName: jobNameRequired && !jobNumberRequired,
                    showJobNumber: jobNumberRequired || jobNameRequired,
                    currentOrderReview: undefined,
                };
                return newState;
            },

            setOrderReviewResponse( s, response: GetCurrentOrderReviewResponse ) {
                const { poJob } = response;
                const jobNumber = poJob && poJob.jobNumber;
                const jobs =
                    ( poJob && poJob.jobAccounts && poJob.jobAccounts.jobs ) ||
                    [];
                const selectedJob =
                    jobs.find( ( j ) => j.jobNumber === jobNumber ) || null;
                const additionalRecipients =
                    response.additionalRecipients || [];
                const state: OrderReview = {
                    currentDate: formatDate(
                        new Date(),
                        'MM-dd-yyyy',
                        'en_US'
                    ),

                    displayName: null,
                    selectedJob: selectedJob,
                    shippingMethod: response.shippingMethod,
                    deliveryDate: response.deliveryDate,
                    deliveryOption: response.deliveryOption,
                    deliveryTime: response.deliveryTime,
                    shippingAddress: response.shippingAddress,
                    instructions: response.instructions,
                    PO: ( poJob && poJob.poName ) || null,
                    jobNumber: jobNumber,
                    jobName: poJob && poJob.jobName,
                    jobs: jobs,
                    additionalRecipients: additionalRecipients.map( ( email ) => ( {
                        email,
                    } ) ),
                    jobNameRequired: ( poJob && poJob.jobNameRequired ) || false,
                    jobNumberRequired:
                        ( poJob && poJob.jobNumberRequired ) || false,
                    poRequired: ( poJob && poJob.poRequired ) || false,
                    showJobName: ( poJob && poJob.showJobName ) || false,
                    showJobNumber: ( poJob && poJob.showJobNumber ) || false,
                };
                return state;
            },
        } )
        .map( ( s ) => {
            const errors = validationCheck( s );
            const canPlaceOrder = errors.length === 0;

            return {
                ...s,
                canPlaceOrder: canPlaceOrder,
                errors: errors,
                request: getRequest( s ),
            };
        } );

    function validationCheck( s: OrderReview ): Errors[] {
        const { jobNumberRequired, poRequired, jobNameRequired } = s;
        const { jobNumber, jobName } = s;
        const { currentDate, deliveryDate } = s;
        const errors: Errors[] = [];
        const requiredJobNumberIsMissing = jobNumberRequired && !jobNumber;
        if ( requiredJobNumberIsMissing ) {
            errors.push( { error: 'Job number is required', subError: null } );
        }
        const requiredJobNameIsMissing = jobNameRequired && !jobName;
        if ( requiredJobNameIsMissing ) {
            errors.push( { error: 'Job name is required', subError: null } );
        }
        const requirePOIsMissing = poRequired && !s.PO;
        if ( requirePOIsMissing ) {
            errors.push( { error: 'PO is required', subError: null } );
        }
        const dateIsInvalid = currentDate && deliveryDate && new Date( currentDate ).getTime() > new Date( deliveryDate ).getTime();
        if ( dateIsInvalid ) {
            errors.push( { error: 'Date is expired', subError: null } );
        }

        return errors;
    }

    function getRequest( s: OrderReview ): SubmitCurrentOrderRequest {
        return {
            apiSiteId: 'BPP',
            poName: s.PO || '',
            jobNumber: s.jobNumber || '',
            jobName: s.jobName || '',
            additionalRecipients: s.additionalRecipients
                .map( ( w ) => w.email.trim() )
                .filter( ( w ) => w && w !== '' ),
        };
    }
}

export type OrderReviewStore = ReturnType<typeof createOrderReviewStore>;
