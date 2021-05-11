import { post } from "../../common/api/apiUtils";
import { ResultDto } from "../../common/data/journal/ResultDto";
import { TradeJournalFilterDto } from "../../features/trade-journal/filter/TradeJournalFilterDto";
const baseUrl = process.env.API_URL + "/api/v1/statistics/";

export const getTradeJournal = (
  filter: TradeJournalFilterDto
): Promise<ResultDto[]> => post<ResultDto[]>(baseUrl + "trade-journal", filter);

export default {
  getTradeJournal,
};
