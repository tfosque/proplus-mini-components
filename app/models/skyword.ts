export interface SkywordModel {
    id: string;
    title: string;
    body: string;
    KeyTakaway: string;
    featured_data: FeaturedDataModel;
    action: string;
    author?: string;
    keyword: string;
    metainformation: MetaInformationModel;
    publishedDate: string;
    trackingTags?: string;
    wordpressTags?: string;
}

interface FeaturedDataModel {
    featured: string;
    featured_caption: string;
    featured_description: string;
    featured_imagetitle: string;
    featured_imgalt: string;
    featured_name: string;
    featured_url: string;
}

interface MetaInformationModel {
    seoDescription: string;
    seoTitle: string;
}

export const defaultSkywordObj = {
    id: 0,
    title: '',
    body: '',
    publishedDate: '',
    keyword: '',
    KeyTakeaway: '',
    featured_data: { featured_description: '' },
    action: '',
    author: '',
    metainformation: {},
};
