import {SecurityAnalysis} from "./SecurityAnalysis";

export class SecurityLastInfo extends SecurityAnalysis {
    public lotSize: number
    public issueSize: number
    public weightedAveragePrice: number

    public futureTotalDemand: number
    public futureTotalSupply: number
    public futureSellDepoPerContract: number
    public futureBuyDepoPerContract: number
    public futureStepPrice: number
    public futureStepPriceForNewContract: number
    public futureCurrencyStepPrice: number
    public futureExpDate: number
    public futureDaysToExpDate: number
}