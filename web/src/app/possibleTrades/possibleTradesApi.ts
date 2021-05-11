import { post } from "../../common/api/apiUtils";
import { FilterDto } from "../../common/data/FilterDto";
import { PossibleTrade } from "./data/PossibleTrade";
import { PossibleTradeRequest } from "./data/PossibleTradeRequest";
import { PossibleTradeResult } from "./data/PossibleTradeResult";

export const adjustPossibleTrade = (order: PossibleTrade): PossibleTrade => {
  order.stopTrendPoint.dateTime = new Date(order.stopTrendPoint.dateTime);
  return order;
};

const baseUrl = process.env.API_URL + "/api/v1/possible-trades/";

const getPossibleTrade = (dto: PossibleTradeRequest): Promise<PossibleTrade> =>
  post<PossibleTrade>(baseUrl, dto).then(adjustPossibleTrade);

const tradePossibleTrade = (
  dto: PossibleTradeRequest
): Promise<PossibleTrade> =>
  post<PossibleTrade>(`${baseUrl}create-real`, dto).then(adjustPossibleTrade);

const getPossibleTradesStat = (
  filter: FilterDto
): Promise<PossibleTradeResult[]> =>
  post<PossibleTradeResult[]>(baseUrl + "stat", filter).then((results) => {
    results.forEach(({ possibleTrade }) => {
      adjustPossibleTrade(possibleTrade);
    });
    return results;
  });

export default {
  getPossibleTrade,
  tradePossibleTrade,
  getPossibleTradesStat,
};
