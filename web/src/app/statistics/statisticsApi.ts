import { post } from "../../common/api/apiUtils";
import { FilterDto } from "../../common/data/FilterDto";
import { ResultDto } from "../../common/data/journal/ResultDto";
import { TradeJournalFilterDto } from "../../features/trade-journal/filter/TradeJournalFilterDto";
import { PossibleTradeResult } from "../possibleTrades/data/PossibleTradeResult";
const baseUrl = process.env.API_URL + "/api/v1/statistics/";

export const getTradeJournal = (
  filter: TradeJournalFilterDto
): Promise<ResultDto[]> => post<ResultDto[]>(baseUrl + "trade-journal", filter);

export const getPossibleTradesStat = (
  filter: FilterDto
): Promise<PossibleTradeResult[]> =>
  post<PossibleTradeResult[]>(baseUrl + "possible-trades", filter);

export default {
  getTradeJournal,
  getPossibleTradesStat,
};
