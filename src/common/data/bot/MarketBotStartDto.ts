import {TradingPlatform} from "../TradingPlatform";
import {Interval} from "../Interval";
import {ClassCode} from "../ClassCode";
import {DepositSetup} from "../DepositSetup";
import {HistorySetup} from "../HistorySetup";
import {TradingStrategy} from "../TradingStrategy";

export class MarketBotStartDto {
    public brokerId: number;
    public tradingPlatform: TradingPlatform;
    public classCode: ClassCode;
    public secCode: string;

    public timeFrameTrading: Interval;
    public timeFrameMin: Interval;

    public depositSetup: DepositSetup;
    public historySetup: HistorySetup;

    public strategy: TradingStrategy = TradingStrategy.futuresSimpleTradingStrategy;
}