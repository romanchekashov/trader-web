import {handleError, handleResponse} from "../apiUtils";
import {TradePremise} from "../dto/strategy/TradePremise";
import {TradeStrategyAnalysisFilterDto} from "./dto/TradeStrategyAnalysisFilterDto";
import {Interval} from "../dto/Interval";
import {Trend} from "../dto/strategy/Trend";
import {ClassCode} from "../dto/ClassCode";
import {PatternResult} from "../dto/pattern/PatternResult";
import {AlertsFilter} from "../../features/tradestrategyanalysis/alerts/AlertsFilter";

const baseUrl = process.env.API_URL + "/api/v1/trade-strategy-analysis/";

export function getTradePremise(filter: TradeStrategyAnalysisFilterDto): Promise<TradePremise> {
    return fetch(baseUrl + 'premise', {
        method: "POST", // POST for create, PUT to update when id already exists.
        headers: {"content-type": "application/json"},
        body: JSON.stringify(filter)
    })
        .then(handleResponse)
        .catch(handleError);
}

export function getCandlePatterns(filter: AlertsFilter): Promise<PatternResult[]> {
    return fetch(baseUrl + 'candle-patterns', {
        method: "POST", // POST for create, PUT to update when id already exists.
        headers: {"content-type": "application/json"},
        body: JSON.stringify(filter)
    })
        .then(handleResponse)
        .catch(handleError);
}

export function getTrend(classCode: ClassCode, securityCode: string, interval: Interval, numberOfCandles: number): Promise<Trend> {
    return fetch(`${baseUrl}trend?classCode=${classCode}&securityCode=${securityCode}&interval=${interval}&numberOfCandles=${numberOfCandles}`)
        .then(handleResponse)
        .catch(handleError);
}
