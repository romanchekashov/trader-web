import {handleError, handleResponse} from "../apiUtils";
import {TradePremise} from "../../data/strategy/TradePremise";
import {TradeStrategyAnalysisFilterDto} from "../../data/TradeStrategyAnalysisFilterDto";
import {Interval} from "../../data/Interval";
import {Trend} from "../../data/strategy/Trend";
import {ClassCode} from "../../data/ClassCode";
import {PatternResult} from "../../components/alerts/data/PatternResult";
import {FilterDto} from "../../data/FilterDto";
import {NotificationDto} from "../../components/notifications/data/NotificationDto";
import {MarketStateFilterDto} from "../../components/market-state/data/MarketStateFilterDto";
import {MarketStateDto} from "../../components/market-state/data/MarketStateDto";
import {SwingStateDto} from "../../components/swing-state/data/SwingStateDto";
import {MoexOpenInterest} from "../../data/open-interest/MoexOpenInterest";
import {
    adjustMarketState,
    adjustMoexOpenInterest, adjustMoexOpenInterestList,
    adjustSwingStateDto,
    adjustTradePremise
} from "../../utils/DataUtils";
import {MoexApiOpenInterest} from "../../data/open-interest/MoexApiOpenInterest";

const baseUrl = process.env.API_URL + "/api/v1/trade-strategy-analysis/";

export function getTradePremise(filter: TradeStrategyAnalysisFilterDto): Promise<TradePremise> {
    return fetch(baseUrl + 'premise', {
        method: "POST", // POST for create, PUT to update when id already exists.
        headers: {"content-type": "application/json"},
        body: JSON.stringify(filter)
    })
        .then(response => handleResponse(response)
            .then(premise => {
                adjustTradePremise(premise);
                return premise;
            }))
        .catch(handleError);
}

export function getTrend(classCode: ClassCode, securityCode: string, interval: Interval, numberOfCandles: number): Promise<Trend> {
    return fetch(`${baseUrl}trend?classCode=${classCode}&securityCode=${securityCode}&interval=${interval}&numberOfCandles=${numberOfCandles}`)
        .then(handleResponse)
        .catch(handleError);
}

export function getCandlePatterns(filter: FilterDto): Promise<PatternResult[]> {
    return fetch(baseUrl + 'candle-patterns', {
        method: "POST", // POST for create, PUT to update when id already exists.
        headers: {"content-type": "application/json"},
        body: JSON.stringify(filter)
    })
        .then(response => handleResponse(response)
            .then(patternResults => {
                if (patternResults && patternResults.length > 0) {
                    for (const result of patternResults) {
                        result.candle.timestamp = new Date(result.candle.timestamp)
                    }
                }
                return patternResults;
            }))
        .catch(handleError);
}

export function getNotifications(filter: FilterDto): Promise<NotificationDto[]> {
    return fetch(baseUrl + 'notifications', {
        method: "POST", // POST for create, PUT to update when id already exists.
        headers: {"content-type": "application/json"},
        body: JSON.stringify(filter)
    })
        .then(response => handleResponse(response)
            .then(notifications => {
                if (notifications && notifications.length > 0) {
                    for (const notification of notifications) {
                        notification.created = new Date(notification.created);
                        notification.notified = new Date(notification.notified);
                    }
                }
                return notifications;
            }))
        .catch(handleError);
}

export function getMarketState(filter: MarketStateFilterDto): Promise<MarketStateDto> {
    return fetch(baseUrl + 'market-state', {
        method: "POST", // POST for create, PUT to update when id already exists.
        headers: {"content-type": "application/json"},
        body: JSON.stringify(filter)
    })
        .then(response => handleResponse(response)
            .then(adjustMarketState))
        .catch(handleError);
}

export function getSwingStates(filter: MarketStateFilterDto): Promise<SwingStateDto[]> {
    return fetch(baseUrl + 'swing-states', {
        method: "POST", // POST for create, PUT to update when id already exists.
        headers: {"content-type": "application/json"},
        body: JSON.stringify(filter)
    })
        .then(response => handleResponse(response)
            .then(states => {
                for (const state of states) {
                    adjustSwingStateDto(state)
                }
                return states;
            }))
        .catch(handleError);
}

export function getMoexOpenInterest(classCode: ClassCode, secCode: string): Promise<MoexOpenInterest> {
    return fetch(`${baseUrl}moex-open-interest?classCode=${classCode}&secCode=${secCode}`)
        .then(response => handleResponse(response)
            .then(adjustMoexOpenInterest))
        .catch(handleError);
}

export function getMoexApiOpenInterestList(classCode: ClassCode, secCode: string): Promise<MoexOpenInterest[]> {
    return fetch(`${baseUrl}moex-api-open-interest-list?classCode=${classCode}&secCode=${secCode}`)
        .then(response => handleResponse(response)
            .then(adjustMoexOpenInterestList))
        .catch(handleError);
}