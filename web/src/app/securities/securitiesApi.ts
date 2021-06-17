import { get } from "../../common/api/apiUtils";
import { SecurityCurrency } from "../../common/data/security/SecurityCurrency";
import { SecurityFuture } from "../../common/data/security/SecurityFuture";
import { SecurityInfo } from "../../common/data/security/SecurityInfo";
import { SecurityLastInfo } from "../../common/data/security/SecurityLastInfo";
import { SecurityShare } from "../../common/data/security/SecurityShare";
import { adjustSecurities, adjustSecurity, adjustShares } from "../../common/utils/DataUtils";

const baseUrl = process.env.API_URL + "/api/v1/securities";

const getSecurityInfos = (): Promise<SecurityInfo[]> =>
  get<SecurityInfo[]>(`${baseUrl}/info`).then(list => {
    for (const item of list) item.expDate = new Date(item.expDate);
    return list;
  });

const getLastSecurities = (): Promise<SecurityLastInfo[]> =>
  get<SecurityLastInfo[]>(baseUrl).then(
    adjustSecurities
  );

const getLastSecurityInfo = (secId: number): Promise<SecurityLastInfo> =>
  get<SecurityLastInfo>(`${baseUrl}/${secId}`).then(
    adjustSecurity
  );

const getFutureInfo = (secCode: string): Promise<SecurityFuture> =>
  get<SecurityFuture>(`${baseUrl}/future-info?secCode=${secCode}`);

const getAllSecurityFutures = (): Promise<SecurityFuture[]> =>
  get<SecurityFuture[]>(`${baseUrl}/futures`);

const getAllSecurityShares = (): Promise<SecurityShare[]> =>
  get<SecurityShare[]>(`${baseUrl}/shares`).then(adjustShares);

const getAllSecurityCurrencies = (): Promise<SecurityCurrency[]> =>
  get<SecurityCurrency[]>(`${baseUrl}/currencies`);

export default {
  getSecurityInfos,
  getLastSecurities,
  getLastSecurityInfo,
  getFutureInfo,
  getAllSecurityFutures,
  getAllSecurityShares,
  getAllSecurityCurrencies,
};
