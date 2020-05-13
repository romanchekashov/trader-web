import * as React from "react";

import {format} from "d3-format";
import {timeFormat} from "d3-time-format";

import {Chart, ChartCanvas} from "react-financial-charts";
import {
    BarSeries,
    CandlestickSeries,
    Circle,
    LineSeries,
    ScatterSeries, Square,
} from "react-financial-charts/lib/series";
import {XAxis, YAxis} from "react-financial-charts/lib/axes";
import {
    CrossHairCursor,
    CurrentCoordinate,
    EdgeIndicator,
    MouseCoordinateX,
    MouseCoordinateY,
    PriceCoordinate,
} from "react-financial-charts/lib/coordinates";

import {discontinuousTimeScaleProvider} from "react-financial-charts/lib/scale";
import {OHLCTooltip} from "react-financial-charts/lib/tooltip";
// import { fitWidth } from "react-financial-charts/lib/helper";
import {last} from "react-financial-charts/lib/utils";
import {ChartDrawType} from "./data/ChartDrawType";
import {Candle} from "../../data/Candle";
import {ChartLevel} from "./data/ChartLevel";
import {SRZone} from "../../data/strategy/SRZone";
import ChartZones from "./ChartZones";
import {Interval} from "../../data/Interval";
import {SRLevel} from "../../data/strategy/SRLevel";
import {ChartLevels} from "./ChartLevels";

type Props = {
    data: Candle[]
    width?: any
    ratio?: any
    type: ChartDrawType
    htSRLevels?: ChartLevel[]
    orders?: ChartLevel[]
    stops?: ChartLevel[]
    zones?: SRZone[]
    srLevels?: SRLevel[]
    candlePatternsUp?: any
    candlePatternsDown?: any
    swingHighsLowsMap?: any
    showGrid?: boolean
    scale: number
};

export class CandleStickChartForDiscontinuousIntraDay extends React.Component<Props, {}> {

    onTrendLineStart = (a: any) => {
        // this gets called on
        // 1. draw complete of trendline
        // 2. drag complete of trendline
        console.log("onTrendLineStart: ", a);
    };

    onTrendLineComplete = (trends1: any) => {
        // this gets called on
        // 1. draw complete of trendline
        // 2. drag complete of trendline
        console.log(trends1);
    };


    render() {
        const {
            type, data: initialData, width, ratio, htSRLevels, orders, stops,
            swingHighsLowsMap, showGrid, zones, candlePatternsUp, candlePatternsDown, scale, srLevels
        } = this.props;

        const height = 500;
        const margin = {left: 50, right: 50, top: 10, bottom: 30};
        const gridHeight = height - margin.top - margin.bottom;
        const xGrid = showGrid ? {
            innerTickSize: -1 * gridHeight,
            // tickStrokeDasharray: 'Solid',
            tickStrokeOpacity: 0.2,
            tickStrokeWidth: 1
        } : {};

        const xScaleProvider = discontinuousTimeScaleProvider
            .inputDateAccessor(d => d.timestamp);
        const {
            data,
            xScale,
            xAccessor,
            displayXAccessor,
        } = xScaleProvider(initialData);

        const start = xAccessor(last(data));
        const end = xAccessor(data[Math.max(0, data.length - 150)]);
        const xExtents = [start, end];
        let key = 0;
        const formatInput = `.${scale}f`;
        let timeFormatInput = "%H:%M:%S";
        if (initialData && initialData.length > 0 && initialData[0]) {
            const interval = initialData[0].interval;
            if (Interval.MONTH === interval || Interval.WEEK === interval || Interval.DAY === interval) {
                timeFormatInput = "%d.%m.%Y";
            }
        }
        const htSRLevelsView = htSRLevels.map(lvl => (
            <PriceCoordinate
                key={lvl.price.toString() + key++}
                at="left"
                orient="left"
                price={lvl.price}
                stroke={lvl.appearance.stroke || 'grey'}
                lineStroke={lvl.appearance.stroke || 'grey'}
                lineOpacity={1}
                strokeWidth={1}
                fontSize={12}
                fill={lvl.appearance.stroke || "#FFFFFF"}
                arrowWidth={7}
                displayFormat={format(formatInput)}
            />
        ));
        const ordersView = orders.map(lvl => (
            <PriceCoordinate
                key={lvl.price.toString() + key++}
                at="right"
                orient="right"
                price={lvl.price}
                stroke={lvl.appearance.stroke || 'grey'}
                lineStroke={lvl.appearance.stroke || 'grey'}
                lineOpacity={1}
                strokeWidth={1}
                fontSize={12}
                fill={lvl.appearance.stroke || "#FFFFFF"}
                arrowWidth={7}
                displayFormat={format(formatInput)}
            />
        ));
        const stopsView = stops.map(lvl => (
            <PriceCoordinate
                key={lvl.price.toString() + key++}
                at="right"
                orient="right"
                price={lvl.price}
                stroke={lvl.appearance.stroke || 'grey'}
                lineStroke={lvl.appearance.stroke || 'grey'}
                lineOpacity={1}
                strokeWidth={1}
                fontSize={12}
                fill={lvl.appearance.stroke || "#FFFFFF"}
                arrowWidth={7}
                displayFormat={format(formatInput)}
            />
        ));

        return (
            <ChartCanvas height={height}
                         ratio={ratio}
                         width={width}
                         margin={{left: 50, right: 50, top: 10, bottom: 30}}
                         type={type}
                         seriesName="MSFT"
                         data={data}
                         xScale={xScale}
                         xAccessor={xAccessor}
                         displayXAccessor={displayXAccessor}
                         xExtents={xExtents}>

                <Chart id={2}
                       yExtents={d => [d.volume]}
                       height={150} origin={(w, h) => [0, h - 150]}>
                    <YAxis axisAt="left" orient="left" ticks={5} tickFormat={format(".2s")}/>

                    <MouseCoordinateY
                        at="left"
                        orient="left"
                        displayFormat={format(".4s")}/>

                    <BarSeries yAccessor={d => d.volume} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"}/>

                    <CurrentCoordinate yAccessor={d => d.volume} fill="#9B0A47"/>

                    <EdgeIndicator itemType="last" orient="right" edgeAt="right"
                                   yAccessor={d => d.volume} displayFormat={format(".4s")} fill="#0F0F0F"/>
                </Chart>

                <Chart id={1}
                       yExtents={d => [d.high, d.low]}
                       padding={{top: 40, bottom: 20}}>
                    <XAxis axisAt="bottom" orient="bottom" {...xGrid}/>
                    <YAxis axisAt="right" orient="right" ticks={5}/>

                    <MouseCoordinateX
                        rectWidth={60}
                        at="bottom"
                        orient="bottom"
                        displayFormat={timeFormat(timeFormatInput)}/>
                    <MouseCoordinateY
                        at="right"
                        orient="right"
                        displayFormat={format(formatInput)}/>

                    {
                        zones ? <ChartZones zones={zones}/> : null
                    }

                    {
                        srLevels ? <ChartLevels srLevels={srLevels}/> : null
                    }

                    <CandlestickSeries fill={(d) => d.close > d.open ? "#ecf0f1" : "#000"}
                                       stroke="#000"
                                       wickStroke="#000"/>
                    <EdgeIndicator itemType="last" orient="right" edgeAt="right"
                                   yAccessor={d => d.close} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"}/>

                    <OHLCTooltip origin={[-40, 0]} xDisplayFormat={timeFormat("%Y-%m-%d %H:%M:%S")}/>

                    {htSRLevelsView}
                    {ordersView}
                    {stopsView}

                    {
                        swingHighsLowsMap ?
                            <LineSeries
                                yAccessor={d => swingHighsLowsMap[d.timestamp.getTime()]}
                                strokeDasharray="Solid" connectNulls={true}/> : null
                    }

                    {
                        swingHighsLowsMap ?
                            <ScatterSeries
                                yAccessor={d => {
                                    return swingHighsLowsMap[d.timestamp.getTime()];
                                }}
                                marker={Circle}
                                markerProps={{r: 3}}/> : null
                    }

                    {
                        candlePatternsUp ?
                            <ScatterSeries
                                yAccessor={d => {
                                    return candlePatternsUp[d.timestamp.getTime()];
                                }}
                                marker={Square}
                                markerProps={{width: 16, stroke: "#43a047", fill: "#43a047"}}/> : null
                    }

                    {
                        candlePatternsDown ?
                            <ScatterSeries
                                yAccessor={d => {
                                    return candlePatternsDown[d.timestamp.getTime()];
                                }}
                                marker={Square}
                                markerProps={{width: 16, stroke: "#e53935", fill: "#e53935"}}/> : null
                    }

                    {/*<TrendLine type={"LINE"}
                               enabled={false}
                               snap={false}
                               snapTo={d => [d.high, d.low]}
                               onStart={this.onTrendLineStart}
                               onComplete={this.onTrendLineComplete}
                               trends={trends}  />*/}
                </Chart>
                <CrossHairCursor/>
            </ChartCanvas>
        );
    }
}
