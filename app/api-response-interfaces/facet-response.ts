/**
 * Interface that maps to an expected piece of the API returns
 */
export interface FacetResponse {
    children?: FacetResponse[];
    facetId: string;
    facetName: string;
    recordCount: number;
    selected: boolean;
}
