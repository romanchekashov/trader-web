import {handleError, handleResponse} from "../apiUtils";
import {ClassCode} from "../../data/ClassCode";
import {Deposit} from "../../data/Deposit";
import {SecurityType} from "../../data/SecurityType";

const baseUrl = process.env.API_URL + "/api/v1/capital/";


export function getDeposits(classCode: ClassCode): Promise<Deposit[]> {
    return fetch(`${baseUrl}deposits?classCode=${classCode}`)
        .then(handleResponse)
        .catch(handleError);
}

export function getCurrentDeposit(type: SecurityType): Promise<Deposit> {
    return fetch(`${baseUrl}current-deposit?type=${type}`)
        .then(handleResponse)
        .catch(handleError);
}
