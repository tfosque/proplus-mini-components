import { CreatedByUser } from './created-by-user';
import { TemplateItem } from './template-item';

export interface TemplateDetail {
    accountName: string;
    createdByUser: CreatedByUser;
    lastModifiedDate: string;
    templateName: string;
    templateItems: TemplateItem[];
    accountLegacyId: string;
    lastModifiedUser: CreatedByUser;
    templateId: string;
}
