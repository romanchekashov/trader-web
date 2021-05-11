import { get, del } from "../../common/api/apiUtils";
import { ActiveTrade } from "../../common/data/ActiveTrade";

const baseUrl = process.env.API_URL + "/api/v1/active-trades/";

const getActiveTrades = (): Promise<ActiveTrade[]> =>
  get<ActiveTrade[]>(baseUrl);

const deleteActiveTrades = (secId: number): Promise<void> =>
  del<void>(`${baseUrl}${secId}`);

export default {
  getActiveTrades,
  deleteActiveTrades,
};
