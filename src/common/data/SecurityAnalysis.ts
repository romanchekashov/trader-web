import {Security} from "./Security";
import {Signal} from "./Signal";

export class SecurityAnalysis extends Security {
    public atrDayPercent: number
    public atrM60Percent: number
    public atrM5Percent: number
    public distancePassedSinceLastDayCloseRelativeToAtr: number
    public distancePassedSinceLastDayCloseRelativeToAtrAvg: number
    public percentOfFloatTradedToday: number
    public gapDay: number
    public gapDayPercent: number
    public volumeM60Percent: number
    public volumeM5Percent: number
    public relativeVolumeDay: number
    public signals: Signal[]
}