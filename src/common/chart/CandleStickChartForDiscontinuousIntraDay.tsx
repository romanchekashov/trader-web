import * as React from "react";

import {format} from "d3-format";
import {timeFormat} from "d3-time-format";

import {Chart, ChartCanvas} from "react-financial-charts";
import {BarSeries, CandlestickSeries,} from "react-financial-charts/lib/series";
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
import {ChartLevel} from "./data/ChartLevel";
import {Candle} from "../../api/dto/Candle";

type Props = {
    data: Candle[],
    width?: any,
    ratio?: any,
    type: ChartDrawType,
    htSRLevels?: ChartLevel[]
    orders?: ChartLevel[]
};

class CandleStickChartForDiscontinuousIntraDay extends React.Component<Props, {}> {

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
        const { type, data: initialData, width, ratio, htSRLevels, orders } = this.props;

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
        const htSRLevelsView = htSRLevels.map(lvl => (
            <PriceCoordinate
                key={lvl.price.toString()}
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
                displayFormat={format(".2f")}
            />
        ));
        const ordersView = orders.map(lvl => (
            <PriceCoordinate
                key={lvl.price.toString()}
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
                displayFormat={format(".2f")}
            />
        ));

        return (
            <ChartCanvas height={500}
                         ratio={ratio}
                         width={width}
                         margin={{ left: 80, right: 80, top: 10, bottom: 30 }}
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
                        displayFormat={format(".4s")} />

                    <BarSeries yAccessor={d => d.volume} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"} />

                    <CurrentCoordinate yAccessor={d => d.volume} fill="#9B0A47" />

                    <EdgeIndicator itemType="last" orient="right" edgeAt="right"
                                   yAccessor={d => d.volume} displayFormat={format(".4s")} fill="#0F0F0F"/>
                </Chart>
                <Chart id={1}
                       yExtents={d => [d.high, d.low]}
                       padding={{ top: 40, bottom: 20 }}>
                    <XAxis axisAt="bottom" orient="bottom"/>
                    <YAxis axisAt="right" orient="right" ticks={5} />

                    <MouseCoordinateX
                        rectWidth={60}
                        at="bottom"
                        orient="bottom"
                        displayFormat={timeFormat("%H:%M:%S")} />
                    <MouseCoordinateY
                        at="right"
                        orient="right"
                        displayFormat={format(".2f")} />

                    <CandlestickSeries />
                    <EdgeIndicator itemType="last" orient="right" edgeAt="right"
                                   yAccessor={d => d.close} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"}/>

                    <OHLCTooltip origin={[-40, 0]} xDisplayFormat={timeFormat("%Y-%m-%d %H:%M:%S")}/>

                    {htSRLevelsView}
                    {ordersView}

                    {/*<TrendLine type={"LINE"}
                               enabled={false}
                               snap={false}
                               snapTo={d => [d.high, d.low]}
                               onStart={this.onTrendLineStart}
                               onComplete={this.onTrendLineComplete}
                               trends={trends}  />*/}
                </Chart>
                <CrossHairCursor />
            </ChartCanvas>
        );
    }
}

// CandleStickChartForDiscontinuousIntraDay = fitWidth(CandleStickChartForDiscontinuousIntraDay);

export default CandleStickChartForDiscontinuousIntraDay;