import {ClassCode} from "../ClassCode";
import {Interval} from "../Interval";
import {DepositSetup} from "../DepositSetup";

export class TradingStrategyConfig {
    public classCode: ClassCode;
    public secCode: string;
    public timeFrameTrading: Interval;
    public timeFrameMin: Interval;
    public depositSetup: DepositSetup;
    public key: string;
}