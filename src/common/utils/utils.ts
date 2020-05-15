export function round100(num: any): number {
    return Math.round(num * 100) / 100;
}

export function roundByMultiplier(num: number, multiplier: number): number {
    return Math.round(num * multiplier) / multiplier;
}

export function calcMultiplier(num: number): number {
    const precision = ("" + num).split(".")[1].length;
    return Math.pow(10, precision);
}

export interface PrimeDropdownItem<T> {
    label: string
    value: T
}

export interface StoreData<T> {
    save?: T
    delete?: T
}

export const sortAlphabetically = (arr: any[], field?: string): any[] => {
    if (field) {
        return arr.sort((a, b) => {
            if(a[field] < b[field]) { return -1; }
            if(a[field] > b[field]) { return 1; }
            return 0;
        });
    } else {
        return arr.sort((a, b) => {
            if(a < b) { return -1; }
            if(a > b) { return 1; }
            return 0;
        });
    }
};