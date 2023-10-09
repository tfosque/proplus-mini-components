import { v4 as uuid } from 'uuid';
import { ContentSectionTypes } from '../enums/content-section-types.enum';

/**
 * Class for use with in page nav.  Given a string to display, generates a unique ID to accompany that string.
 */
export class InPageNavItem {
    navTitle: string;
    private _navId: string;
    private _contentSectionType: ContentSectionTypes | null;

    constructor(
        navTitle: string,
        navId: string = '',
        contentSectionType: ContentSectionTypes | null = null
    ) {
        this.navTitle = navTitle;

        if (!navId) {
            this._navId = `nav-item_${uuid()}`;
        } else {
            this._navId = navId;
        }

        this._contentSectionType = contentSectionType;
    }

    get navId(): string {
        return this._navId;
    }

    get contentSectionType(): ContentSectionTypes | null {
        return this._contentSectionType;
    }
}
