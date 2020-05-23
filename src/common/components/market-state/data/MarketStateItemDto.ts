import {CandleSentiment} from "../../../data/strategy/CandleSentiment";
import {OperationType} from "../../../data/OperationType";
import {Signal} from "../../../data/Signal";
import {TrendDirection} from "../../../data/strategy/TrendDirection";
import {Candle} from "../../../data/Candle";

export class MarketStateItemDto {
    public candle: Candle;
    public candleSentiment: CandleSentiment;
    public emaCrossPrice: number;
    public emaCrossOperation: OperationType;
    public signals: Signal[];
    public trendDirection: TrendDirection;
}