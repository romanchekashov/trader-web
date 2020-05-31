import * as React from "react";
import {Circle, LineSeries, ScatterSeries} from "react-financial-charts/lib/series";
import {IntervalColor, TrendDirectionColor} from "../../../utils/utils";
import {TrendDirection} from "../../../data/strategy/TrendDirection";
import {TrendWrapper} from "../../../data/TrendWrapper";

type Props = {
    swingHighsLows: TrendWrapper[]
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

    return (
        <>
            {
                swingHighsLows.map(trendWrapper => {
                    const all = {};
                    let color = IntervalColor[trendWrapper.trend.interval];

                    if (trendWrapper.isSelectedTimeFrame) {
                        color = color || '#2196f3';
                        const up = {};
                        const down = {};
                        const side = {};
                        const unknown = {};

                        for (const trendPoint of trendWrapper.trend.swingHighsLows) {
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
                                <ScatterSeries
                                    yAccessor={d => down[d.timestamp.getTime()]}
                                    marker={Circle}
                                    markerProps={{
                                        r: 3,
                                        stroke: TrendDirectionColor[TrendDirection.DOWN],
                                        fill: TrendDirectionColor[TrendDirection.DOWN]
                                    }}/>

                                <ScatterSeries
                                    yAccessor={d => up[d.timestamp.getTime()]}
                                    marker={Circle}
                                    markerProps={{
                                        r: 3,
                                        stroke: TrendDirectionColor[TrendDirection.UP],
                                        fill: TrendDirectionColor[TrendDirection.UP]
                                    }}/>

                                <ScatterSeries
                                    yAccessor={d => side[d.timestamp.getTime()]}
                                    marker={Circle}
                                    markerProps={{
                                        r: 3,
                                        stroke: TrendDirectionColor[TrendDirection.SIDE],
                                        fill: TrendDirectionColor[TrendDirection.SIDE]
                                    }}/>

                                <LineSeries
                                    yAccessor={d => all[d.timestamp.getTime()]}
                                    stroke={color}
                                    strokeDasharray="Solid"
                                    connectNulls={true}/>
                                <ScatterSeries
                                    yAccessor={d => unknown[d.timestamp.getTime()]}
                                    marker={Circle}
                                    markerProps={{r: 3, stroke: color, fill: color}}/>
                            </>
                        )
                    } else {
                        color = color || defaultColorStroke;

                        for (const trendPoint of trendWrapper.trend.swingHighsLows) {
                            all[trendPoint.dateTime.getTime()] = trendPoint.swingHL;
                        }

                        return (
                            <>
                                <LineSeries
                                    yAccessor={d => all[d.timestamp.getTime()]}
                                    stroke={color}
                                    strokeDasharray="Solid"
                                    connectNulls={true}/>
                            </>
                        )
                    }
                })
            }

        </>
    )
};
