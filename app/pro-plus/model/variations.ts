import { AttributeValues } from './attribute-values';
export interface Variations {
    [attribute: string]: AttributeValues;
}

export interface IAttrOption {
    value: string;
    enabled: boolean;
}

type Sku = string;
type Attrb = string;
type Value = string;

export interface Variation {
    attr: string;
    attrValue: string;
    sku: string;
}

export function getUniqueColors(
    variations: Variations
): { key: string; value: string }[] {
    const colors = variations['color'];
    const map = new Map<string, string>(
        toIterable(function* () {
            for (const [color, skus] of Object.entries(colors)) {
                for (const sku of skus) {
                    yield [color, sku] as [string, string];
                }
            }
        })
    );

    return Array.from(map.entries()).map(([color, sku]) => {
        return { key: color, value: sku };
    });
}

export function getSelectionForSKU(variations: Variations, sku: string) {
    const selectedFacets = new Map<string, Set<string>>();
    return selectedFacets;
}

export function applyVariationsFilter(
    allVariations: Variations,
    selectedFilters: Map<string, string>,
    activeVariations: Record<string, IAttrOption[]>,
    attr: string,
    value: string
) {
    //  Check to see if we should clear the other dropdowns - based on whether the
    //  selection was enabled
    const shouldClear = !activeVariations[attr].filter(
        (v) => v.value === value
    )[0].enabled;
    //  Copy the selected filters so we can update it without triggering a rerender.
    const newFilters = new Map(selectedFilters.entries());
    if (shouldClear) {
        newFilters.clear();
    }
    newFilters.set(attr, value);

    //  Calculate our active options and get the list of SKUs matching our filter
    const { facetOptions, foundSkus } = getActiveVariations(
        newFilters,
        allVariations
    );

    //
    for (const name of Object.keys(allVariations)) {
        const enabledOptions = facetOptions[name].filter((o) => o.enabled);
        //  If there's only one variation enabled, automatically select it
        if (enabledOptions.length === 1) {
            newFilters.set(name, enabledOptions[0].value);
        }
    }

    const selectedSKU =
        foundSkus.size === 1 ? Array.from(foundSkus.values())[0] : null;

    return { newFilters, facetOptions, selectedSKU };
}

/**
 * Returns all the options for all facets based on what's selected
 */
export function getActiveVariations(
    selectedFilters: Map<string, string>,
    variations: Variations
) {
    //  Removed selected filters not in the variation list
    const variationKeys = new Set(Object.keys(variations));
    selectedFilters.forEach((v, key) => {
        if (!variationKeys.has(key)) {
            selectedFilters.delete(key);
        }
    });
    //  Get all of the options for every attribute (Used to compare later)
    const variationsSet = toSet(variations);
    const allOptions = getAttributeLookups(variationsSet);

    const allOptionsArray = Array.from(allOptions.entries());
    const facetOptionMap = new Map(
        allOptionsArray.map(([attr, allValues]) => {
            const optionsForItem = new Map<string, string>(
                selectedFilters.entries()
            );
            optionsForItem.delete(attr);
            const filteredOptions = getFilteredOptions(
                optionsForItem,
                variationsSet
            );
            const filteredValues = filteredOptions.get(attr) || new Set();

            const attrOptions: IAttrOption[] = Array.from(allValues).map(
                (v) => ({
                    value: v,
                    enabled: filteredValues.has(v),
                })
            );

            attrOptions.sort((a, b) => {
                if (a.value === b.value) {
                    return 0;
                } else if (a.value > b.value) {
                    return 1;
                } else {
                    return -1;
                }
            });

            return [attr, attrOptions] as [string, IAttrOption[]];
        })
    );
    const foundSkus = findSkusFor(selectedFilters, variationsSet);
    const facetOptions = mapToObj(facetOptionMap);
    return { facetOptions, foundSkus };
}

function getFilteredOptions(
    selectedFilters: Map<string, string>,
    variationsSet: Variation[]
) {
    const foundSkus = findSkusFor(selectedFilters, variationsSet);
    const filteredVariations = variationsSet.filter((v) =>
        foundSkus.has(v.sku)
    );
    const filteredOptions = getAttributeLookups(filteredVariations);
    return filteredOptions;
}

function findSkusFor(
    selectedFilters: Map<string, string>,
    variationsSet: Variation[]
) {
    const selection =
        Array.from(selectedFilters.entries()).map(([attr, value]) => ({
            attr,
            value,
        })) || [];
    //  Start with all the SKUs and only keep the SKUs found for each filter
    let foundSkus = new Set<Sku>(variationsSet.map((v) => v.sku));
    for (const f of selection) {
        const skus = findSkus(f.attr, f.value, variationsSet);
        foundSkus = intersection(foundSkus, skus);
        // console.log('found skus', foundSkus, skus)
    }
    return foundSkus;
}

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

function getAttributeLookups(variations: Variation[]): Map<Attrb, Set<Value>> {
    const attributeValues = new Map<Attrb, Set<Value>>();
    for (const v of variations) {
        let optionSet = attributeValues.get(v.attr);
        if (optionSet !== undefined) {
            optionSet.add(v.attrValue);
        } else {
            optionSet = new Set([v.attrValue]);
            attributeValues.set(v.attr, optionSet);
        }
    }
    return attributeValues;
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

function toIterable<T>(f: () => Iterable<T>): Iterable<T> {
    return f();
}

export function toSet(
    input: Record<string, Record<string, string[]>>
): Variation[] {
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
