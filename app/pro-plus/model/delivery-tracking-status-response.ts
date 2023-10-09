export interface DeliveryStatusResponse {
    emailAddress: string;
    dtPhoneNumber: string | null;
    dtStatusChangeNotification: DtStatusChangeNotification[];
    dtAdminStatusChangeNotification: DtStatusChangeNotification[] | null;
    dtOrderStatusChangeNotification?: DtStatusChangeNotification;
    callbackParam: string | null;
    code: number | null;
    message: string | null;
    messageCode: number | null;
    result: string | null;
}

export interface DtStatusChangeNotification {
    displayName: string;
    label: string;
    notifications: Notification[];
}

export interface Notification {
    displayName: string;
    value: string;
    selected: boolean;
}
