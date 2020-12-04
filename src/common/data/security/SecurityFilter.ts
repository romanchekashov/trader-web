import {TradingPlatform} from "../trading/TradingPlatform";
import {BrokerId} from "../BrokerId";

export class SecurityFilter {
    public brokerId: BrokerId
    public tradingPlatform: TradingPlatform
    public secId: number
}