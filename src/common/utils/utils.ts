import {Interval} from "../data/Interval";

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

export const Intervals: Interval[] = [Interval.M1, Interval.M3, Interval.M5,
    Interval.M15, Interval.M30, Interval.M60, Interval.H2, Interval.H4, Interval.DAY,
    Interval.WEEK, Interval.MONTH];

export const IntervalColor = {
    MONTH: "#4a148c",
    WEEK: "#880e4f",
    DAY: "#ff0000", // "#b71c1c"
    H4: "#e65100",
    H2: "#fbc02d",
    M60: "#00796b",
    M30: "#212121"
};