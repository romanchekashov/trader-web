import {Security} from "./Security";

export class SecurityFuture extends Security {
    public buyDepoPerContract: number
    public sellDepoPerContract: number
    public stepPrice: number
    public stepPriceForNewContract: number

    public currencyStepPrice: string
    public expDate: Date
    public daysToExpDate: number
}