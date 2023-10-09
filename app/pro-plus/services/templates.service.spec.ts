// import { testTemplates } from './template-data';
// import { TemplateDetail } from '../model/template-detail';
// import { TemplateItem } from '../model/template-item';

//  For more information about testing, see the Angular HttpClient Testing in Depth guide
//  URL:  https://www.ng-conf.org/2019/angulars-httpclient-testing-depth/

xdescribe('TemplateService', () => {
    beforeEach(() => {});

    it('Test Search', async (done) => {
        const variations = toSet(getTestVariations());

        //  findSkus: (Attr, Value) -> Set<Sku>

        //  filterBySku: Set<Sku> -> Variations -> Variations
        //  getAttributeLookups: Variations -> Map<Attr, Set<Value>>
        //  getDropDowns: (Attr, Value)[] -> Variations -> Map<Attr, (Value, Enabled)[])>

        const result = getDropDowns(variations, [
            { attr: 'color', value: 'Tan' },
            { attr: 'size', value: "6' x 100'" },
        ]);
        const r = mapToObj(result);
        dump({ r });

        // for (const [key, values] of Array.from(result.entries())) {
        //     dump({ key, values });
        // }

        // const template = createTemplate(testTemplates.result);
        // await expect(template.name).toBe('Test04');
        done();
    });
});

type Sku = string;
type Attrb = string;
type Value = string;

function findSkus(
    attr: string,
    value: string,
    variations: Variation[]
): Set<string> {
    return new Set(
        variations
            .filter((v) => v.attr === attr && v.attrValue === value)
            .map((v) => v.sku)
    );
}

function filterBySku(skus: Set<Sku>, variations: Variation[]): Variation[] {
    return variations.filter((v) => skus.has(v.sku));
}

function getAttributeLookups(variations: Variation[]): Map<Attrb, Set<Value>> {
    const map = new Map<Attrb, Set<Value>>();
    for (const v of variations) {
        let s = map.get(v.attr);
        if (s !== undefined) {
            s.add(v.attrValue);
        } else {
            s = new Set([v.attrValue]);
            map.set(v.attr, s);
        }
    }
    return map;
}

function getDropDowns(
    variations: Variation[],
    filters: Filter[]
): Map<Attrb, IAttrOption[]> {
    //: (Attr, Value)[] -> Variations -> Map<Attr, (Value, Enabled)[])>
    //  Get all of the options for every attribute (Used to compare later)
    const allOptions = getAttributeLookups(variations);

    let foundSkus: Set<Sku> | null = null;
    for (const f of filters) {
        const skus = findSkus(f.attr, f.value, variations);

        if (foundSkus === null) {
            foundSkus = skus;
        } else {
            foundSkus = intersection(foundSkus, skus);
        }
        console.log('found skus', foundSkus, skus);
    }

    foundSkus = foundSkus || new Set();

    const filteredVariations = filterBySku(foundSkus, variations);
    const filteredOptions = getAttributeLookups(filteredVariations);

    const allOptionsArray = Array.from(allOptions.entries());
    const resultArray = allOptionsArray.map(([attr, allValues]) => {
        const filteredValues = filteredOptions.get(attr) || new Set();
        const attrOptions: IAttrOption[] = Array.from(allValues).map((v) => ({
            value: v,
            enabled: filteredValues.has(v),
        }));

        return [attr, attrOptions] as [string, IAttrOption[]];
    });
    return new Map(resultArray);
}

function intersection<T>(setA: Set<T>, setB: Set<T>): Set<T> {
    const _intersection = new Set<T>();
    for (const elem of Array.from(setB)) {
        if (setA.has(elem)) {
            _intersection.add(elem);
        }
    }
    return _intersection;
}

type LookupType = string | number | symbol;

function mapToObj<T extends LookupType, U>(inputMap: Map<T, U>): Record<T, U> {
    const obj = {} as Record<T, U>;

    inputMap.forEach(function (value, key) {
        obj[key] = value;
    });

    return obj;
}

interface IAttrOption {
    value: string;
    enabled: boolean;
}

interface Filter {
    attr: string;
    value: string;
}

interface Variation {
    attr: string;
    attrValue: string;
    sku: string;
}

function toSet(input: Record<string, Record<string, string[]>>): Variation[] {
    const result = [];
    for (const [attr, skuValues] of Object.entries(input)) {
        for (const [attrValue, skus] of Object.entries(skuValues)) {
            for (const sku of skus) {
                result.push({ attr, attrValue, sku });
            }
        }
    }
    return result;
}

function dump(o: any) {
    console.log(JSON.stringify(o, null, 2));
}

function getTestVariations(): Record<string, Record<string, string[]>> {
    return {
        color: {
            Tan: ['35746', '276774', '26716', '19807', '35752'],
            'Mansard Brown': ['580593'],
            White: [
                '44557',
                '35742',
                '255951',
                '16476',
                '35750',
                '17082',
                '16204',
                '16731',
                '16203',
                '32536',
            ],
            'Slate Grey': ['604632'],
            'Medium Bronze': ['640539'],
            'Terra Cotta': ['538950'],
            Grey: ['340747', '16743', '35743', '45703', '35751', '16144'],
        },
        size: {
            "4' x 100'": ['17082', '16731'],
            "8' x 100'": ['16476', '16743'],
            "6' x 100'": [
                '35746',
                '340747',
                '44557',
                '35743',
                '35742',
                '32536',
            ],
            "12' x 100'": ['35752', '35751', '35750'],
            "10' x 100'": [
                '640539',
                '276774',
                '26716',
                '538950',
                '255951',
                '16144',
                '604632',
                '16204',
                '19807',
                '16203',
                '45703',
                '580593',
            ],
        },
        thickness: {
            '60 mil': [
                '26716',
                '538950',
                '16476',
                '16144',
                '17082',
                '35746',
                '640539',
                '35743',
                '35742',
                '35752',
                '35751',
                '35750',
                '604632',
                '16204',
                '16743',
                '580593',
            ],
            '45 mil': ['19807', '16731', '16203', '32536'],
            '80 mil': ['340747', '276774', '44557', '45703', '255951'],
        },
    };
}

enum TemplateItemViewMode {
    ViewOnly,
    SelectingOptions,
}

export interface Template {
    readonly id: number;
    name: string;
    job?: Job;
    items: TemplateViewItem[];
    // getJobOptions(): Job[];
    // add(product: Product): Template;
    // delete(product: Product): Template;
}

interface Job {
    number: number;
    name: string;
}

interface TemplateViewItem {
    readonly product: IProduct;
    mode: TemplateItemViewMode;
    selectedItem?: Item;
    qty: number;
    selectedUnitOfMeasure: string | null;
    // search(s: Search): ItemSearchResult;
}

// interface Search {
//     terms: string[];
// }

interface Image {
    text: string;
    url: string;
    // getThumbnail(): string;
}

interface IProduct {
    readonly productId: string;
    readonly name: string;
    readonly description: string;
    readonly unitPrice: number;
    readonly unitOfMeasure: string;
    readonly SKUs: Item[];
    readonly units: Unit[];
}

interface Unit {
    readonly unit: string;
    readonly pricePerUnit: number;
}

interface Item {
    readonly itemId: number;
    readonly image: Image;
    readonly name: string;
    readonly unitPrice: number;
    readonly unitOfMeasure: string;
    readonly facets: Record<FacetName, FacetValues>;
}

type FacetName = string;
type FacetValues = string[];

// interface ItemSearchResult {
//     readonly search: Search;
//     readonly results: SearchResultItem[];
//     readonly columns: string[];
//     readonly uniqueFacets: Record<FacetName, FacetValues>;
// }

// interface SearchResultItem {
//     readonly thumbnail: string;
//     readonly itemId: number;
//     readonly name: string;
//     readonly description: string;
//     readonly unitPrice: number;
//     readonly unitOfMeasure: number;
//     readonly facets: Record<FacetName, FacetValues>;
// }

// function createTemplate(input: TemplateDetail): Template {

//     return {
//         id: parseInt(input.templateId, 10),
//         name: input.templateName,
//         items: input.templateItems.map(i => getTemplateItem(i))
//     };
// }

// function getTemplateItem(i: TemplateItem): TemplateViewItem {
//     return {
//         qty: i.quantity || 0,
//         selectedUnitOfMeasure: i.unitOfMeasure || null,
//         mode: TemplateItemViewMode.ViewOnly,
//         selectedItem: {
//             itemId: i.itemNumber,
//             image: {
//                 text: i.itemOrProductDescription,
//                 url: i.imageUrl?.large
//             },
//             name: i.itemOrProductDescription,
//             unitPrice: i.itemUnitPrice,
//             unitOfMeasure: i.unitOfMeasure,
//             facets: {}
//         },
//         product: {
//             productId: i.productOrItemNumber || '',
//             name: i.itemOrProductDescription,
//             description: '',
//             unitPrice: 0,
//             unitOfMeasure: '',
//             SKUs: [],
//             units: []
//         }
//     };
// }
