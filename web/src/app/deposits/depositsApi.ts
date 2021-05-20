import { get } from "../../common/api/apiUtils";
import { FuturesClientLimit } from "../../common/data/FuturesClientLimit";

const baseUrl = process.env.API_URL + "/api/v1/";

const getFuturesLimits = (): Promise<FuturesClientLimit[]> =>
  get<FuturesClientLimit[]>(`${baseUrl}futures-limits`);

export default {
  getFuturesLimits,
};
