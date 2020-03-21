import {handleError, handleResponse} from "./apiUtils";
import {SecurityShare} from "./dto/SecurityShare";

const baseUrl = process.env.API_URL + "/api/v1/";

export function getSecurityShares(): Promise<SecurityShare[]> {
    return fetch(baseUrl + 'security-shares')
        .then(handleResponse)
        .catch(handleError);
}
