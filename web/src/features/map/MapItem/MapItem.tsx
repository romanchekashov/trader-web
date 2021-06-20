import * as React from "react";
import { useEffect } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { setSecurityById } from "../../../app/securities/securitiesSlice";
import { DemandSupply } from "../../../common/components/demand-supply/DemandSupply";
import { SecurityLastInfo } from "../../../common/data/security/SecurityLastInfo";
import { formatNumber } from "../../../common/utils/utils";
import "./MapItem.css";

type Props = {
    security: SecurityLastInfo;
    evening: boolean;
    selected: boolean;
    className?: string;
    height: number;
};

const MapItem: React.FC<Props> = ({ security, evening, selected, className = "", height }) => {
    const dispatch = useAppDispatch();

    useEffect(() => {
    }, []);

    if (!security) return (
        <div className={`${className} MapItem`} style={{ height }}>
            No data
        </div>
    );

    const { ticker, type, shareSection, lastTradePrice, lastChange, valueToday, totalDemand, totalSupply } = security;

    const bgColor = (lastChange: number): string => {
        if (lastChange > 0) {
            if (lastChange > 8) {
                return 'win-lg';
            } else if (lastChange > 4) {
                return 'win';
            } else {
                return 'win-sm';
            }
        }

        if (lastChange < 0) {
            if (lastChange < -8) {
                return 'loss-lg';
            } else if (lastChange < -4) {
                return 'loss';
            } else {
                return 'loss-sm';
            }
        }

        return "";
    };

    return (
        <div className={`${className} MapItem ${selected ? 'selected' : ""} ${bgColor(lastChange)}`}
            style={{ height }}
            onClick={e => dispatch(setSecurityById(security.id))}>
            <div>
                <strong>{ticker} ({type.substring(0, 1)}{shareSection ? `-${shareSection}` : ""})</strong>(End: {evening ? "23:50" : <strong>18:40</strong>}) <strong>{lastTradePrice}</strong> ({formatNumber(valueToday)})
            </div>
            <div>
                <span className="lastChange">{lastChange}%</span>
            </div>
            <DemandSupply
                totalDemand={totalDemand}
                totalSupply={totalSupply}
            />
        </div>
    );
};

export default MapItem;