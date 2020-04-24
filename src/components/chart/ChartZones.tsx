import * as React from "react";
import {SRZone} from "../../data/strategy/SRZone";
import {AreaOnlySeries} from "react-financial-charts/lib/series";
import {Interval} from "../../data/Interval";
import moment = require("moment");

type Props = {
    zones: SRZone[]
};

const ChartZones: React.FC<Props> = ({zones}) => {

    const zoneYAccessor = (d, zone) => zone.start;
    const zoneYAccessorBase = (scale, d, zone) => {
        const diff = zone.start - zone.end;
        return scale(zoneYAccessor(d, zone) + (diff > 0 ? diff : 0.05));
    };

    const intersects = zones.map(zone => zone.intersects).sort((a, b) => b - a);
    const max = intersects.length > 0 ? intersects[0] : 1;

    return (
        <>
            {
                zones.map(zone => {
                    let color = "#cfd8dc";
                    if (Interval.DAY === zone.interval) {
                        color = "#263238";
                    } else if (Interval.H4 === zone.interval) {
                        color = "#455a64";
                    } else if (Interval.H2 === zone.interval) {
                        color = "#607d8b";
                    } else if (Interval.M60 === zone.interval) {
                        color = "#90a4ae";
                    }

                    const elKey = zone.interval.toString() + zone.start + zone.end
                        + moment(zone.candles[0].timestamp).toDate().getTime();

                    return (
                        <AreaOnlySeries
                            key={elKey}
                            base={(scale, d) => zoneYAccessorBase(scale, d, zone)}
                            yAccessor={d => zoneYAccessor(d, zone)}
                            opacity={zone.intersects * 0.8 / max}
                            stroke={color}
                            fill={color}/>
                    );
                })
            }
        </>
    )
};

export default ChartZones;