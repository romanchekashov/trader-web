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