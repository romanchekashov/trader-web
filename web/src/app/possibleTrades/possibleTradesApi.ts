import { post } from "../../common/api/apiUtils";
import { PossibleTrade } from "./data/PossibleTrade";
import { PossibleTradeRequest } from "./data/PossibleTradeRequest";

const baseUrl = process.env.API_URL + "/api/v1/possible-trades/";

const getPossibleTrade = (dto: PossibleTradeRequest): Promise<PossibleTrade> =>
  post<PossibleTrade>(baseUrl, dto);

const tradePossibleTrade = (
  dto: PossibleTradeRequest
): Promise<PossibleTrade> => post<PossibleTrade>(`${baseUrl}create-real`, dto);

export default {
  getPossibleTrade,
  tradePossibleTrade,
};
