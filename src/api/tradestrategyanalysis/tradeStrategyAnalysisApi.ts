import {handleError, handleResponse} from "../apiUtils";
import {TradePremise} from "../dto/strategy/TradePremise";
import {TradeStrategyAnalysisFilterDto} from "./dto/TradeStrategyAnalysisFilterDto";

const baseUrl = process.env.API_URL + "/api/v1/trade-strategy-analysis/";

export function getTradePremise(filter: TradeStrategyAnalysisFilterDto): Promise<TradePremise> {
    return fetch(baseUrl + 'premise', {
        method: "POST", // POST for create, PUT to update when id already exists.
        headers: { "content-type": "application/json" },
        body: JSON.stringify(filter)
    })
        .then(handleResponse)
        .catch(handleError);
}
