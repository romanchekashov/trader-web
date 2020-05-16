import * as React from "react";
import {Circle, LineSeries, ScatterSeries} from "react-financial-charts/lib/series";
import {TrendPoint} from "../../../data/strategy/TrendPoint";
import {TrendDirectionColor} from "../../../utils/utils";
import {TrendDirection} from "../../../data/strategy/TrendDirection";

type Props = {
    swingHighsLows: TrendPoint[]
};

export const ChartSwingHighsLows: React.FC<Props> = ({swingHighsLows}) => {

    if (!swingHighsLows || swingHighsLows.length === 0) return null;

    const lineTypeMap = {
        MONTH: "LongDashDotDot",
        WEEK: "LongDashDot",
        DAY: "Solid",
        H4: "LongDash",
        H2: "DashDot",
        M60: "Dot"
    };

    const defaultColorStroke = '#757575';
    let lineSeriesColorStroke = defaultColorStroke;
    let scatterSeriesColorStroke = defaultColorStroke;

    const up = {};
    const down = {};
    const side = {};
    const unknown = {};
    const all = {};

    for (const trendPoint of swingHighsLows) {
        switch (trendPoint.trendDirection) {
            case TrendDirection.DOWN:
                down[trendPoint.dateTime.getTime()] = trendPoint.swingHL;
                break;
            case TrendDirection.UP:
                up[trendPoint.dateTime.getTime()] = trendPoint.swingHL;
                break;
            case TrendDirection.SIDE:
                side[trendPoint.dateTime.getTime()] = trendPoint.swingHL;
                break;
            default:
                unknown[trendPoint.dateTime.getTime()] = trendPoint.swingHL;
                break;
        }
        all[trendPoint.dateTime.getTime()] = trendPoint.swingHL;
    }

    return (
        <>
            {/*<LineSeries
                yAccessor={d => down[d.timestamp.getTime()]}
                stroke={TrendDirectionColor[TrendDirection.DOWN]}
                strokeDasharray="Solid"
                connectNulls={true}/>*/}
            <ScatterSeries
                yAccessor={d => down[d.timestamp.getTime()]}
                marker={Circle}
                markerProps={{r: 3,
                    stroke: TrendDirectionColor[TrendDirection.DOWN],
                    fill: TrendDirectionColor[TrendDirection.DOWN]}}/>

            {/*<LineSeries
                yAccessor={d => up[d.timestamp.getTime()]}
                stroke={TrendDirectionColor[TrendDirection.UP]}
                strokeDasharray="Solid"
                connectNulls={true}/>*/}
            <ScatterSeries
                yAccessor={d => up[d.timestamp.getTime()]}
                marker={Circle}
                markerProps={{r: 3,
                    stroke: TrendDirectionColor[TrendDirection.UP],
                    fill: TrendDirectionColor[TrendDirection.UP]}}/>

            {/*<LineSeries
                yAccessor={d => side[d.timestamp.getTime()]}
                stroke={TrendDirectionColor[TrendDirection.SIDE]}
                strokeDasharray="Solid"
                connectNulls={true}/>*/}
            <ScatterSeries
                yAccessor={d => side[d.timestamp.getTime()]}
                marker={Circle}
                markerProps={{r: 3,
                    stroke: TrendDirectionColor[TrendDirection.SIDE],
                    fill: TrendDirectionColor[TrendDirection.SIDE]}}/>

            <LineSeries
                yAccessor={d => all[d.timestamp.getTime()]}
                stroke={defaultColorStroke}
                strokeDasharray="Solid"
                connectNulls={true}/>
            <ScatterSeries
                yAccessor={d => unknown[d.timestamp.getTime()]}
                marker={Circle}
                markerProps={{r: 3, stroke: defaultColorStroke, fill: defaultColorStroke}}/>
        </>
    )
};
