import {Security} from "./Security";

export class SecurityShare extends Security {
    public lotSize: number
    public issueSize: number
    public weightedAveragePrice: number
    public percentOfFreeFloatTradedToday: number
}