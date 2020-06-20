import {TradingStrategyTrade} from "./TradingStrategyTrade";
import {ResultDto} from "../journal/ResultDto";

export class HistoryStrategyResultDto {
    public trades: TradingStrategyTrade[];
    public stat: ResultDto;
}
