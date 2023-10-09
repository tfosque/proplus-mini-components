export interface SignupEmailForm {
    emailAddress: string;
    firstName: string;
    lastName: string;
    zipCode: string;
    phoneNumber: string;
}

export interface SignupAccountForm {
    companyName: string;
    account: string;
    invoice: string;
    invoiceDate: string;
    emailAddress: string;
    firstName: string;
    lastName: string;
    zipCode: string;
    phoneNumber: string;
    emailFormInfo: SignupEmailForm;
}

export interface ValidateByEmailOrAccountResponse {
    messages?: Message[] | null;
    result: ValidateByEmailOrAccount;
    success: boolean;
}

interface Message {
    type: string;
    value: string;
    code: string;
}

export interface ValidateByEmailOrAccount {
    userRegInfo: UserRegInfo;
    showBranchSelection: boolean;
    branchSelection?: BranchSelection | null;
    showAccountSelection: boolean;
    accountSelection?: AccountInfo[] | null;
    retryTimesLeft: number;
    needLogin: boolean;
    needRetry: boolean;
    needContactSupport: boolean;
    needGetUserRegisterToken: boolean;
    registerSuccess: boolean;
}

export interface UserRegInfo {
    registerUserEmailType?: any;
    emailAddress: string;
    firstName: string;
    lastName: string;
    zipCode: string;
    phoneNumber: string;
    accountInfos?: AccountInfo[] | null;
    internalUser: boolean;
    userRegisterToken: string;
    emailFormInfo: SignupEmailForm | null;
    companyName: string | null;
    registerFailReason?: any;
    validationErrorTimes?: any;
    invoiceDate: string | null;
    osrAccounts: string[] | null;
    invoice: string | null;
    account: string | null;
    token?: string | null;
    fullName?: string | null;
    registerDate?: string | null;
}

interface AccountInfo {
    accountId: string;
    accountName: string;
    branchId: string;
}

interface BranchSelection {
    accountId: string;
    accountName: string;
    branches: Branch[];
}

interface Branch {
    branchId: string;
    branchName: string;
}
