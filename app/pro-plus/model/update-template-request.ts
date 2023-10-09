export type UpdateTemplateRequest =
    | CreateTemplateRequestBody
    | UpdateTemplateRequestBody
    | DeleteTemplateRequestBody;

export interface CreateTemplateRequestBody {
    action: 'createItem';
    account: string;
    templateId: string;
    templateName: string;
    invokeBy?: string;
    items: TemplateCreateItem[];
}

export interface DeleteTemplateRequestBody {
    action: 'deleteItem';
    templateId: string;
    account: string;
    templateName: string;
    items: TemplateDeleteItem[];
}

export interface UpdateTemplateRequestBody {
    action: 'updateItem';
    invokeBy?: 'store';
    ignoreInvalidItems?: true;
    templateId: string;
    account: string;
    templateName: string;
    items: TemplateUpdateItem[];
}

export interface TemplateCreateItem {
    itemNumber: string;
    unitOfMeasure: string;
    quantity: number;
    matchColor?: string | null;
    matchMFG?: string | null;
}

export interface TemplateDeleteItem {
    templateItemId: string;
}

export interface TemplateUpdateItem {
    templateItemId: string;
    itemNumber: string;
    unitOfMeasure: string;
    quantity: number;
    itemNumberChanged?: boolean;
    color?: string | null;
    MFG?: string | null;
    nickName?: string | null;
    vendorColorId?: string;
    matchColor?: string;
    matchMFG?: string;
}
