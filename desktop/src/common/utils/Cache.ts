import {ClassCode} from "../data/ClassCode";
import {getAllSecurityCurrencies, getAllSecurityFutures, getAllSecurityShares} from "../api/rest/traderRestApi";
import {Security} from "../data/Security";

const securityMap = {};
let futures = [];
let shares = [];
let currencies = [];

const fetchSecurities = () => {
    getAllSecurityFutures()
        .then(securities => {
            futures = securities;
            for (const security of securities) {
                securityMap[security.classCode + security.secCode] = security;
            }
        })
        .catch(console.error);
    getAllSecurityShares()
        .then(securities => {
            shares = securities;
            for (const security of securities) {
                securityMap[security.classCode + security.secCode] = security;
            }
        })
        .catch(console.error);
    getAllSecurityCurrencies()
        .then(securities => {
            currencies = securities;
            for (const security of securities) {
                securityMap[security.classCode + security.secCode] = security;
            }
        })
        .catch(console.error);
};
fetchSecurities();

export const getSecurity = (classCode: ClassCode, secCode: string): Security => {
    return securityMap[classCode + secCode];
};

export const getSecuritiesByClassCode = (classCode: ClassCode): Security[] => {
    switch (classCode) {
        case ClassCode.SPBFUT: return futures;
        case ClassCode.TQBR: return shares;
        case ClassCode.CETS: return currencies;
    }
};