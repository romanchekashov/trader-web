import { get } from "../../common/api/apiUtils";
import { SecurityCurrency } from "../../common/data/security/SecurityCurrency";
import { SecurityFuture } from "../../common/data/security/SecurityFuture";
import { SecurityLastInfo } from "../../common/data/security/SecurityLastInfo";
import { SecurityShare } from "../../common/data/security/SecurityShare";
import { adjustSecurities, adjustSecurity, adjustShares } from "../../common/utils/DataUtils";

const baseUrl = process.env.API_URL + "/api/v1/securities";

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
  getLastSecurities,
  getLastSecurityInfo,
  getFutureInfo,
  getAllSecurityFutures,
  getAllSecurityShares,
  getAllSecurityCurrencies,
};
