import {ClassCode} from "../../dto/ClassCode";
import {Interval} from "../../dto/Interval";

export class TradingStrategyConfig {
    public classCode: ClassCode;
    public secCode: string;
    public timeFrameHigher: Interval;
    public timeFrameTrading: Interval;
    public timeFrameLower: Interval;
    public demo: boolean;
    public key: string;
}