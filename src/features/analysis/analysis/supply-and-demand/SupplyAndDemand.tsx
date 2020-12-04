import * as React from "react";
import {useEffect, useState} from "react";
import {SecurityLastInfo} from "../../../../common/data/security/SecurityLastInfo";
import {SupplyAndDemandChart} from "./SupplyAndDemandChart";
import {SupplyAndDemandData} from "./SupplyAndDemandData";

type Props = {
    security: SecurityLastInfo
};

export const SupplyAndDemand: React.FC<Props> = ({security}) => {

    const [secCode, setSecCode] = useState<string>()
    const [items, setItems] = useState<SupplyAndDemandData[]>([])

    useEffect(() => {
        if (security) {
            if (secCode !== security.secCode) {
                setSecCode(security.secCode)
                setItems([])
            }
            setItems([...items, {
                totalSupply: security.totalSupply,
                totalDemand: security.totalDemand,
                dateTime: new Date()
            }])
        }
    }, [security])

    return (
        <div className="p-grid analysis-head">
            <div className="p-col-12">
                <SupplyAndDemandChart items={items}
                                      title={"Total Supply And Demand of " + secCode}
                                      windowSize={180}
                                      dateTimeFormat={"HH:mm:ss"}
                                      width={1000} height={600}/>
            </div>
        </div>
    )
};