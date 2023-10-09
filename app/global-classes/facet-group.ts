import { Facet } from './facet';

/**
 * Class representing a group of facets from the api.
 */
export class FacetGroup {
    title: string;
    facets: Facet[];

    constructor(title: string, facets: Facet[]) {
        this.title = title;
        this.facets = facets;
    }
}
