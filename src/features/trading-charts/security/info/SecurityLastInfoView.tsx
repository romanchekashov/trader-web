import * as React from "react";
import {useEffect} from "react";
import "./SecurityLastInfoView.css"
import {SecurityLastInfo} from "../../../../common/data/security/SecurityLastInfo";
import {DemandSupply} from "../../../../common/components/demand-supply/DemandSupply";

type Props = {
    security: SecurityLastInfo
}

export const SecurityLastInfoView: React.FC<Props> = ({security}) => {

    useEffect(() => {

        // Specify how to clean up after this effect:
        return function cleanup() {
        }
    }, [])
    if (!security) return null

    return (
        <div className="p-grid security-last-info-view">
            <div className="p-col-12">
                <div>{security.name}</div>
                <div>{security.shortName}(<strong>{security.secCode}</strong>)</div>
                <div>Шаг цены: {security.secPriceStep}</div>
                <div>% изм: {security.lastChange}%</div>
                <div>Оборот: {security.valueToday}</div>
                <DemandSupply totalDemand={security.totalDemand} totalSupply={security.totalSupply}/>
            </div>
        </div>
    )
}