import {handleError, handleResponse} from "../apiUtils";
import {Trade} from "../../data/Trade";
import {Order} from "../../data/Order";
import {StopOrder} from "../../data/StopOrder";
import {adjustOrders, adjustStopOrders, adjustTrades} from "../../utils/DataUtils";

const baseUrl = process.env.API_URL + "/api/v1/quik/";

export function getTrades(limit: number): Promise<Trade[]> {
    return fetch(`${baseUrl}trades?limit=${limit}`)
        .then(response => handleResponse(response)
            .then(adjustTrades))
        .catch(handleError)
}

export function getOrders(limit: number): Promise<Order[]> {
    return fetch(`${baseUrl}orders?limit=${limit}`)
        .then(response => handleResponse(response)
            .then(adjustOrders))
        .catch(handleError)
}

export function getStopOrders(limit: number): Promise<StopOrder[]> {
    return fetch(`${baseUrl}stop-orders?limit=${limit}`)
        .then(response => handleResponse(response)
            .then(adjustStopOrders))
        .catch(handleError)
}
