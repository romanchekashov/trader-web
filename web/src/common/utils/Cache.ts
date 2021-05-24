import securitiesApi from "../../app/securities/securitiesApi";
import { ClassCode } from "../data/ClassCode";
import { Market } from "../data/Market";
import { Security } from "../data/security/Security";
import { SecurityLastInfo } from "../data/security/SecurityLastInfo";
import { SecurityType } from "../data/security/SecurityType";
import { sortAlphabetically } from "./utils";

const securityMap = {};
let futures = [];
let shares = [];
let currencies = [];
let lastSecurities: SecurityLastInfo[] = [];
export const SEC_MAP: Map<number, Security> = new Map();

const fetchSecurityFutures = () => {
  securitiesApi
    .getAllSecurityFutures()
    .then((securities) => {
      futures = sortAlphabetically(securities, "secCode");
      for (const security of securities) {
        securityMap[security.classCode + security.secCode] = security;
      }
    })
    .catch(fetchSecurityFutures);
};
const fetchSecurityShares = () => {
  securitiesApi
    .getAllSecurityShares()
    .then((securities) => {
      shares = sortAlphabetically(securities, "secCode");
      for (const security of securities) {
        securityMap[security.classCode + security.secCode] = security;
      }
    })
    .catch(fetchSecurityShares);
};
const fetchSecurityCurrencies = () => {
  securitiesApi
    .getAllSecurityCurrencies()
    .then((securities) => {
      currencies = sortAlphabetically(securities, "secCode");
      for (const security of securities) {
        securityMap[security.classCode + security.secCode] = security;
      }
    })
    .catch(fetchSecurityCurrencies);
};
// fetchSecurityFutures();
// fetchSecurityShares();
// fetchSecurityCurrencies();

const fetchLastSecurities = () => {
  securitiesApi
    .getLastSecurities()
    .then((securities) => {
      lastSecurities = sortAlphabetically(securities, "secCode");
      for (const security of securities) {
        securityMap[security.classCode + security.secCode] = security;
      }
    })
    .catch(fetchSecurityCurrencies);
};
fetchLastSecurities();

export const getSecuritiesByTypeAndMarket = (
  market: Market,
  type: SecurityType
): Security[] => {
  return lastSecurities.filter(
    (value) => market === value.market && type === value.type
  );
};

export const getSecurity = (
  classCode: ClassCode,
  secCode: string
): Security => {
  return securityMap[classCode + secCode];
};

export const getSecuritiesByClassCode = (classCode: ClassCode): Security[] => {
  switch (classCode) {
    case ClassCode.SPBFUT:
      return futures;
    case ClassCode.TQBR:
      return shares;
    case ClassCode.CETS:
      return currencies;
  }
};

let SELECTED_SECURITY: SecurityLastInfo = null;

export const getSelectedSecurity = () => SELECTED_SECURITY;
export const setSelectedSecurity = (security: SecurityLastInfo) =>
  (SELECTED_SECURITY = security);
