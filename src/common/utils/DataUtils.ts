import {TradePremise} from "../data/strategy/TradePremise";

export const adjustTradePremise = (premise: TradePremise): void => {
    if (premise) {
        if (premise.analysis.srZones) {
            for (const srZone of premise.analysis.srZones) {
                srZone.timestamp = new Date(srZone.timestamp)
            }
        }

        if (premise.analysis.trends) {
            for (const trend of premise.analysis.trends) {
                for (const trendPoint of trend.swingHighsLows) {
                    trendPoint.dateTime = new Date(trendPoint.dateTime);
                }
            }
        }
    }
};