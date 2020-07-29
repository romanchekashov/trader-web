import {TradingPlatform} from "../trading/TradingPlatform";
import {Interval} from "../Interval";
import {ClassCode} from "../ClassCode";
import {DepositSetup} from "../DepositSetup";
import {HistorySetup} from "../HistorySetup";
import {TradingStrategyName} from "../trading/TradingStrategyName";

export class HistoryStartDto {
    public brokerId: number;
    public tradingPlatform: TradingPlatform;
    public classCode: ClassCode;
    public secCode: string;

    public timeFrameTrading: Interval;
    public timeFrameMin: Interval;

    public depositSetup: DepositSetup;
    public historySetup: HistorySetup;

    public strategy: TradingStrategyName;
    public tradingStrategyId: number;
}