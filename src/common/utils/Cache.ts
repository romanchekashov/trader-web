import {ClassCode} from "../data/ClassCode";
import {getAllSecurityCurrencies, getAllSecurityFutures, getAllSecurityShares} from "../api/rest/traderRestApi";
import {Security} from "../data/Security";
import {sortAlphabetically} from "./utils";
import {SecurityLastInfo} from "../data/SecurityLastInfo";

const securityMap = {};
let futures = [];
let shares = [];
let currencies = [];

const fetchSecurityFutures = () => {
    getAllSecurityFutures()
        .then(securities => {
            futures = sortAlphabetically(securities, "secCode");
            for (const security of securities) {
                securityMap[security.classCode + security.secCode] = security;
            }
        })
        .catch(fetchSecurityFutures);
};
const fetchSecurityShares = () => {
    getAllSecurityShares()
        .then(securities => {
            shares = sortAlphabetically(securities, "secCode");
            for (const security of securities) {
                securityMap[security.classCode + security.secCode] = security;
            }
        })
        .catch(fetchSecurityShares);
};
const fetchSecurityCurrencies = () => {
    getAllSecurityCurrencies()
        .then(securities => {
            currencies = sortAlphabetically(securities, "secCode");
            for (const security of securities) {
                securityMap[security.classCode + security.secCode] = security;
            }
        })
        .catch(fetchSecurityCurrencies);
};
fetchSecurityFutures();
fetchSecurityShares();
fetchSecurityCurrencies();

export const getSecurity = (classCode: ClassCode, secCode: string): Security => {
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
export const setSelectedSecurity = (security: SecurityLastInfo) => SELECTED_SECURITY = security;