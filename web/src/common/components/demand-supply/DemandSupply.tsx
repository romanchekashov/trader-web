import * as React from "react";
import "./DemandSupply.css"
import {round100} from "../../utils/utils";

type Props = {
    totalDemand: number
    totalSupply: number
}

export const DemandSupply: React.FC<Props> = ({totalDemand, totalSupply}) => {

    if (!totalDemand || !totalSupply) return null

    const sum = totalDemand + totalSupply
    const demandWidth = totalDemand * 100 / sum
    const supplyWidth = 100 - demandWidth
    const ratio = round100(totalDemand / totalSupply)

    return (
        <div className="demand-supply" title={`Общ спрос: ${totalDemand} / Общ предл: ${totalSupply} = ${ratio}`}>
            <div className="demand" style={{width: demandWidth + '%'}}>
                <span>{Math.round(demandWidth) + '%'}</span>
            </div>
            <div className="supply" style={{width: supplyWidth + '%'}}>
                <span>{Math.round(supplyWidth) + '%'}</span>
            </div>
        </div>
    )
}