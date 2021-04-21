import {Interval} from "../Interval";

export class TradingStrategyConfig {
    public classCode: string;
    public secCode: string;
    public timeFrameHigher: Interval;
    public timeFrameTrading: Interval;
    public timeFrameLower: Interval;
    public demo: boolean;
    public key: string;
}