/**
 * Class representing any facet used for search/browse pages
 */
export class Facet {
    value: string | null;
    key: string | null;
    group: string | null;
    count: number | null;
    selected: boolean;
    type: 'cateFilter' | 'filter';
    permanent: boolean;
    isParentFacet: boolean;
    parentFacetArray: Facet[];

    constructor(
        value: string | null,
        key: string | null,
        group: string | null,
        count: number | null,
        selected: boolean = false,
        type: 'cateFilter' | 'filter' = 'filter',
        permanent: boolean = false,
        parentFacetArray: Facet[] = [],
        isParentFacet?: boolean
    ) {
        this.value = value;
        this.key = key;
        this.group = group;
        this.count = count;
        this.selected = selected;
        this.type = type;
        this.permanent = permanent;
        this.parentFacetArray = parentFacetArray;
        this.isParentFacet = !!isParentFacet;
    }
}
