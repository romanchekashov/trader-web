import {Security} from "./Security";

export class SecurityAnalysis extends Security {
    public atrDayPercent: number;
    public atrM60Percent: number;
    public atrM5Percent: number;
    public percentOfFloatTradedToday: number;
    public gapDay: number;
    public gapDayPercent: number;
    public volumeM60Percent: number;
    public volumeM5Percent: number;
    public volumeToday: number;
    public relativeVolumeDay: number;
}