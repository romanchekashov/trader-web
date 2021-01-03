import * as React from "react";
import {useEffect} from "react";
import "./SecurityLastInfoView.css"
import {SecurityLastInfo} from "../../../../common/data/security/SecurityLastInfo";
import {DemandSupply} from "../../../../common/components/demand-supply/DemandSupply";
import {formatNumber} from "../../../../common/utils/utils";

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
                <div>{security.name}(<strong>{security.secCode}</strong>)</div>
                <div>
                    % изм: <strong>{security.lastChange}% </strong>
                    <span>Шаг цены: {security.secPriceStep}</span>
                </div>
                <div>
                    <span>Сделок: <strong>{security.numTradesToday} </strong></span>
                    <span>Оборот: <strong>{formatNumber(security.valueToday)}</strong></span>
                </div>
                <div>Gap:
                    D: <strong>{security.gapDay} </strong>
                    D(%): <strong>{security.gapDayPercent}%</strong>
                </div>
                <div>GerchikAtrDis(%):
                    AVG(D): <strong>{security.distancePassedSinceLastDayCloseRelativeToAtrAvg} </strong>
                    (D): <strong>{security.distancePassedSinceLastDayCloseRelativeToAtr}</strong>
                </div>
                <div>ATR(14):
                    D: <strong>{security.atrDay} </strong>
                    {security.atrM60 ? <span>M60: <strong>{security.atrM60} </strong></span> : null}
                    M30: <strong>{security.atrM30} </strong>
                    {security.atrM3 ? <span>M3: <strong>{security.atrM3} </strong></span> : null}
                </div>
                <div>Vol(Last/Prev):
                    D: <strong>{security.volumeInPercentDay} </strong>
                    {security.volumeInPercentM60 ? <span>M60: <strong>{security.volumeInPercentM60} </strong></span> : null}
                    M30: <strong>{security.volumeInPercentM30} </strong>
                    {security.volumeInPercentM3 ? <span>M3: <strong>{security.volumeInPercentM3} </strong></span> : null}
                </div>
                <div>
                    Vol Today: <strong>{security.volumeToday} </strong>
                    Rel Vol(D): <strong>{security.relativeVolumeDay}</strong>
                </div>
                {security.percentOfFloatTradedToday ?
                    <div>Float Traded(%): <strong>{security.percentOfFloatTradedToday}</strong></div> : null}
                <DemandSupply totalDemand={security.totalDemand} totalSupply={security.totalSupply}/>
            </div>
        </div>
    )
}