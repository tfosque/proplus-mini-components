interface IFilterable {
    setFilter(attr: string, value: string): void;
}

export class FacetSelector {
    constructor(
        private readonly parentView: IFilterable,
        public readonly name: string,
        private selectedValue: string
    ) {}
    get value() {
        return this.selectedValue;
    }
    set value(newValue) {
        this.selectedValue = newValue;
        this.parentView.setFilter(this.name, this.selectedValue);
    }
    public setValue(newValue: string) {
        this.selectedValue = newValue;
    }
    public clear() {
        this.selectedValue = '';
    }
}
