import { get } from "../../common/api/apiUtils";
import { Deposit } from "../../common/data/Deposit";
import { FuturesClientLimit } from "../../common/data/FuturesClientLimit";
import { SecurityType } from "../../common/data/security/SecurityType";

const baseUrl = process.env.API_URL + "/api/v1/";

const adjustDeposit = (d: Deposit): Deposit => {
  d.created = new Date(d.created);
  return d;
};

const getFuturesLimits = (): Promise<FuturesClientLimit[]> =>
  get<FuturesClientLimit[]>(`${baseUrl}futures-limits`);

const getDeposits = (type: SecurityType): Promise<Deposit[]> =>
  get<Deposit[]>(`${baseUrl}deposits/change?type=${type}`).then((deposits) =>
    deposits.map(adjustDeposit)
  );

const getCurrentDeposit = (type: SecurityType): Promise<Deposit> =>
  get<Deposit>(`${baseUrl}deposits?type=${type}`).then(adjustDeposit);

export default {
  getFuturesLimits,
  getDeposits,
  getCurrentDeposit,
};
