import { get } from "../../common/api/apiUtils";
import { Deposit } from "../../common/data/Deposit";
import { FuturesClientLimit } from "../../common/data/FuturesClientLimit";
import { SecurityType } from "../../common/data/security/SecurityType";

const baseUrl = process.env.API_URL + "/api/v1/";

const getFuturesLimits = (): Promise<FuturesClientLimit[]> =>
  get<FuturesClientLimit[]>(`${baseUrl}futures-limits`);

const getDeposits = (type: SecurityType): Promise<Deposit[]> =>
  get<Deposit[]>(`${baseUrl}deposits/change?type=${type}`);

const getCurrentDeposit = (type: SecurityType): Promise<Deposit> =>
  get<Deposit>(`${baseUrl}deposits?type=${type}`);

export default {
  getFuturesLimits,
  getDeposits,
  getCurrentDeposit,
};
