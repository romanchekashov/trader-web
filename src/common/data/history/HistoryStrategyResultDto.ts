import {ResultDto} from "../journal/ResultDto";
import {TradingStrategyData} from "./TradingStrategyData";

export class HistoryStrategyResultDto {
    public tradingStrategyData: TradingStrategyData;
    public stat: ResultDto;
}
