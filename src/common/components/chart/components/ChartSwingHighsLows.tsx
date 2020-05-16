import * as React from "react";
import {Circle, LineSeries, ScatterSeries} from "react-financial-charts/lib/series";

type Props = {
    swingHighsLowsMap?: any
};

export const ChartSwingHighsLows: React.FC<Props> = ({swingHighsLowsMap}) => {

    if (!swingHighsLowsMap) return null;

    const lineTypeMap = {
        MONTH: "LongDashDotDot",
        WEEK: "LongDashDot",
        DAY: "Solid",
        H4: "LongDash",
        H2: "DashDot",
        M60: "Dot"
    };

    return (
        <>
            <LineSeries
                yAccessor={d => swingHighsLowsMap[d.timestamp.getTime()]}
                strokeDasharray="Solid"
                connectNulls={true}/>
            <ScatterSeries
                yAccessor={d => {
                    return swingHighsLowsMap[d.timestamp.getTime()];
                }}
                marker={Circle}
                markerProps={{r: 2}}/>
        </>
    )
};
