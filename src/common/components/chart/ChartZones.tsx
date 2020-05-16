import * as React from "react";
import {SRZone} from "../../data/strategy/SRZone";
import {AreaOnlySeries} from "react-financial-charts/lib/series";
import {PriceCoordinate} from "react-financial-charts/lib/coordinates";
import {format} from "d3-format";

type Props = {
    zones: SRZone[]
};

const ChartZones: React.FC<Props> = ({zones}) => {

    if (!zones || zones.length === 0) return null;

    const zoneYAccessor = (d, zone) => zone.end;
    const zoneYAccessorBase = (scale, d, zone) => {
        const diff = zone.start - zone.end;
        return scale(zoneYAccessor(d, zone) + diff);
    };
    const colorMap = {
        DAY: "#263238",
        H4: "#455a64",
        H2: "#607d8b",
        M60: "#90a4ae"
    };
    const recentZoneColor = '#2980b9';
    const recentTimeChecker = new Date().getTime() - 7 * 86400000;

    const intersects = zones.map(zone => zone.intersects).sort((a, b) => b - a);
    let max = intersects.length > 0 ? intersects[0] : 1;
    if (max / intersects[1] > 5) max = intersects[1];

    const getOpacity = (zone: SRZone) => {
        if (zone.intersects > max) return 1;
        const opacity = zone.intersects / max;
        return opacity < 0.2 ? 0.2 : opacity;
    };

    const getStrokeWidth = (zoneIntersects: number) => {
        if (zoneIntersects > max) return 2;
        return 1 + (zoneIntersects / max);
    };

    const getArrowWidth = (zoneIntersects: number) => {
        if (zoneIntersects > max) return 7;
        const diff = zoneIntersects / max;
        if (diff > 0.1) return 7;
        return 2;
    };

    return (
        <>
            {
                zones.map(zone => {
                    const color = zone.timestamp.getTime() > recentTimeChecker ? recentZoneColor : 'grey';
                    return (
                        <PriceCoordinate
                            key={"start-" + zone.start + zone.end}
                            at="left"
                            orient="left"
                            price={zone.start}
                            stroke={color}
                            lineStroke={color}
                            lineOpacity={1}
                            strokeWidth={getStrokeWidth(zone.intersects)}
                            fontSize={12}
                            fill={color}
                            arrowWidth={getArrowWidth(zone.intersects)}
                            displayFormat={format(".2f")}
                        />
                    );
                })
            }
            {
                zones
                    .filter(zone => zone.start !== zone.end)
                    .map(zone => {
                        // const color = colorMap[zone.interval] || "#cfd8dc";
                        const color = "#607d8b";

                        // const elKey = zone.interval.toString() + zone.start + zone.end + zone.candles[0].timestamp;

                        return (
                            <AreaOnlySeries
                                key={zone.start + zone.end}
                                base={(scale, d) => zoneYAccessorBase(scale, d, zone)}
                                yAccessor={d => zoneYAccessor(d, zone)}
                                opacity={getOpacity(zone)}
                                stroke={color}
                                fill={color}/>
                        );
                    })
            }
        </>
    )
};

export default ChartZones;