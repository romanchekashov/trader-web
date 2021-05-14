import { Interval } from "../data/Interval";
import moment = require("moment");
import { SecurityType } from "../data/security/SecurityType";
import { ClassCode } from "../data/ClassCode";

export const DATE_TIME_FORMAT = "DD.MM/HH:mm:ss";

export function round(number, precision = 0): number {
  const d = Math.pow(10, precision);
  return Math.round(number * d) / d;
}

export function round10(num: any): number {
  return Math.round(num * 10) / 10;
}

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
  label: string;
  value: T;
}

export interface StoreData<T> {
  save?: T;
  delete?: T;
}

export const sortAlphabetically = (arr: any[], field?: string): any[] => {
  if (field) {
    return arr.sort((a, b) => {
      if (a[field] < b[field]) {
        return -1;
      }
      if (a[field] > b[field]) {
        return 1;
      }
      return 0;
    });
  } else {
    return arr.sort((a, b) => {
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      return 0;
    });
  }
};

export const Intervals: Interval[] = [
  Interval.M1,
  Interval.M3,
  Interval.M5,
  Interval.M15,
  Interval.M30,
  Interval.M60,
  Interval.H2,
  Interval.H4,
  Interval.DAY,
  Interval.WEEK,
  Interval.MONTH,
];

export const IntervalColor = {
  MONTH: "#4a148c",
  WEEK: "#880e4f",
  DAY: "#ff0000", // "#b71c1c"
  H4: "#e65100",
  H2: "#fbc02d",
  M60: "#00796b",
  M30: "#212121",
};

export const TrendDirectionColor = {
  UP: "#4caf50",
  DOWN: "#f44336",
  SIDE: "#2196f3", // "#3f51b5"
};

export const OperationTypeColor = {
  BUY: "#4caf50",
  SELL: "#f44336",
};

export const getRecentBusinessDate = (date: Date): Date => {
  if (!date) return date;

  let mDate = moment(date);
  while (mDate.day() === 0 || mDate.day() === 6) mDate.subtract(1, "days");
  return mDate.toDate();
};

export const formatNumber = (val: number): string => {
  const absVal = Math.abs(val);
  // Nine Zeroes for Billions
  return absVal >= 1.0e9
    ? round100(absVal / 1.0e9) + " B"
    : // Six Zeroes for Millions
    absVal >= 1.0e6
    ? round100(absVal / 1.0e6) + " M"
    : // Three Zeroes for Thousands
    absVal >= 1.0e3
    ? round100(absVal / 1.0e3) + " K"
    : absVal + "";
};

export const pageJumpById = (elId: string, offset?: number): void => {
  var top = document.getElementById(elId).offsetTop; //Getting Y of target element
  window.scrollTo(0, top - (offset || 0)); //Go there directly or some transition
};
export const ClassCodeToSecTypeMap = {
  [ClassCode.SPBFUT]: SecurityType.FUTURE,
  [ClassCode.TQBR]: SecurityType.STOCK,
  [ClassCode.CETS]: SecurityType.CURRENCY,
};

export const Colors = {
  GREEN: "#1F9D55",
  RED: "#E3342F",
  BLUE: "#0d47a1",
};

export const LineTypeMap = {
  MONTH: "LongDashDotDot",
  WEEK: "LongDashDot",
  DAY: "Solid",
  H4: "LongDash",
  H2: "DashDot",
  M60: "Dot",
};
