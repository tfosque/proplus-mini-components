export interface UserPermissions {
    original: OriginalPermissions;
    computed: ComputedPermissions;
}

export type AllPermissions = ComputedPermissions & { original: OriginalPermissions };

export interface OriginalPermissions {
    ["Approve Orders"]: {
        Yes: boolean;
        No: boolean;
    };
    Price: {
        Yes: boolean;
        No: boolean;
    };
    ["Place Order"]: {
        Yes: boolean;
        No: boolean;
        ["Yes, with Approval"]: boolean;
    };
    ["Order History"]: {
        ["Yes,w/out Pricing"]: boolean;
        ["Yes,with Pricing"]: boolean;
        No: boolean;
    };
    Quotes: {
        View: boolean;
        Manage: boolean;
        No: boolean;
    };
    RebateView: {
        Yes: boolean;
        No: boolean;
    };
}

export const defaultOriginalPermissions: OriginalPermissions =  {
    ["Approve Orders"]: {
        Yes: false,
        No: true
    },
    Price: {
        Yes: false,
        No: true
    },
    ["Place Order"]: {
        Yes: false,
        No: true,
        ["Yes, with Approval"]: false
    },
    ["Order History"]: {
        ["Yes,w/out Pricing"]: false,
        ["Yes,with Pricing"]: false,
        No: true
    },
    Quotes: {
        View: false,
        Manage: false,
        No: true
    },
    RebateView: {
        Yes: false,
        No: true
    },
};

export interface ComputedPermissions {
    price: boolean;
    order: OrderPermissions;
    orderhistory: OrderHistoryPermissions;
    quote: QuotePermissions;
    rebate: RebatePermissions;
}
/**
 * Order Permissions Functionality
 */
export interface OrderPermissions {
    /** Can the user submit an order?  */
    submit: boolean;
    /** Can the user approve others? */
    approve: boolean;
    /** Can the user submit orders to be approved by others? */
    submitForApproval: boolean;
    /** ???  Can the user change the shipping address */
    checkoutShippingAddress: boolean;
    checkoutOrderReview: boolean;
    checkoutOrderConfirmation: boolean;
}
export type OrderHistoryPermissions = {
    queryList: boolean;
    queryDetail: boolean;
    withPrice: boolean;
    withoutPrice: boolean;
};
export interface QuotePermissions {
    edit: boolean;
    upload: boolean;
    submit: boolean;
    update: boolean;
    submitForm: boolean;
    queryList: boolean;
    queryListOpen: boolean;
    queryListInProgress: boolean;
    queryListProcessed: boolean;
    queryDetailOpen: boolean;
    queryDetailInProgress: boolean;
    queryDetailProcessed: boolean;
}
export type RebatePermissions = {
    submit: boolean;
    landing: boolean;
    form: boolean;
    redeemedSummary: boolean;
    redeemedDetail: boolean;
    thankyou?: boolean;
    denied?: boolean;
};
export const defaultComputedPermissions: ComputedPermissions = {
    order: {
        submit: false,
        approve: false,
        submitForApproval: false,
        checkoutShippingAddress: false,
        checkoutOrderReview: false,
        checkoutOrderConfirmation: false,
    },
    orderhistory: {
        queryList: false,
        queryDetail: false,
        withPrice: false,
        withoutPrice: false,
    },
    price: false,
    quote: {
        edit: false,
        upload: false,
        submit: false,
        update: false,
        submitForm: false,
        queryList: false,
        queryListOpen: false,
        queryListInProgress: false,
        queryListProcessed: false,
        queryDetailOpen: false,
        queryDetailInProgress: false,
        queryDetailProcessed: false,
    },
    rebate: {
        submit: false,
        landing: false,
        form: false,
        thankyou: false,
        denied: false,
        redeemedSummary: false,
        redeemedDetail: false,
    },
};
