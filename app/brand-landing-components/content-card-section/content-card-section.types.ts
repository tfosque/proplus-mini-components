import { Reference } from '@bloomreach/spa-sdk';
import { Image } from '../../global-classes/image';

export interface CMSContentCardSection {
    id: string;
    name: string;
    displayName: string;
    contentCards: CMSContentCardData[];
    localeString: string;
}

export interface CMSContentCardData {
    name: string;
    displayName: string;
    isExternal: boolean;
    image: Reference;
    category: string;
    title: string;
    link?: string;
    description: string;
    id: string;
    url?: string;
    primaryDocument?: any;
}

export interface ContentCardData {
    image: Image | null;
    heading: string;
    category: string;
    description: string;
    isExternal: boolean;
    url: string;
}
