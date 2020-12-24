import {Security} from "./Security";
import {Signal} from "../Signal";

export class SecurityAnalysis extends Security {
    public atrDay: number
    public atrM60: number
    public atrM30: number
    public atrM3: number
    public volumeInPercentDay: number
    public volumeInPercentM60: number
    public volumeInPercentM30: number
    public volumeInPercentM3: number
    public atrM5Percent: number
    public distancePassedSinceLastDayCloseRelativeToAtr: number
    public distancePassedSinceLastDayCloseRelativeToAtrAvg: number
    public percentOfFloatTradedToday: number
    public gapDay: number
    public gapDayPercent: number
    public relativeVolumeDay: number
    public signals: Signal[]
}