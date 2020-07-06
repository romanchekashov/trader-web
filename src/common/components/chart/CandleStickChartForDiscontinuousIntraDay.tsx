import * as React from "react";
import {format} from "d3-format";
import {timeFormat} from "d3-time-format";

import {Chart, ChartCanvas} from "react-financial-charts";
import {
    BarSeries,
    CandlestickSeries,
    Circle,
    LineSeries,
    ScatterSeries,
    Square,
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
import {last, toObject} from "react-financial-charts/lib/utils";
import {ChartDrawType} from "./data/ChartDrawType";
import {Candle} from "../../data/Candle";
import {ChartLevel} from "./data/ChartLevel";
import {SRZone} from "../../data/strategy/SRZone";
import ChartZones from "./components/ChartZones";
import {Interval} from "../../data/Interval";
import {SRLevel} from "../../data/strategy/SRLevel";
import {ChartLevels} from "./components/ChartLevels";
import {DrawingObjectSelector, TrendLine} from "react-financial-charts/lib/interactive";
import {ema} from "react-financial-charts/lib/indicator";
import {
    getInteractiveNodes,
    isCurrentChartInteractingId,
    saveInteractiveNodes,
    setCurrentChartInteractingId,
} from "./utils/interactiveutils";
import {TrendLineDto} from "../../data/TrendLineDto";
import {StoreData} from "../../utils/utils";
import {ChartTrendLine} from "./data/ChartTrendLine";
import {ChartSwingHighsLows} from "./components/ChartSwingHighsLows";
import {TrendPoint} from "../../data/strategy/TrendPoint";
import {Trend} from "../../data/strategy/Trend";
import {TrendWrapper} from "../../data/TrendWrapper";

const _ = require("lodash");

type Props = {
    data: Candle[]
    width?: any
    ratio?: any
    chartHeight?: number
    type: ChartDrawType
    htSRLevels?: ChartLevel[]
    orders?: ChartLevel[]
    stops?: ChartLevel[]
    zones?: SRZone[]
    srLevels?: SRLevel[]
    candlePatternsUp?: any
    candlePatternsDown?: any
    swingHighsLows?: TrendWrapper[]
    showGrid?: boolean
    scale: number
    enableTrendLine: boolean
    onEnableTrendLine: (enableTrendLine: boolean) => void
    needSave: (storeData: StoreData<TrendLineDto[]>) => void
    trends: ChartTrendLine[]
};

interface State {
    trends_1: ChartTrendLine[]
}

export class CandleStickChartForDiscontinuousIntraDay extends React.Component<Props, State> {

    private id: any;
    private trendRef: any;
    private canvasNode: any;
    private node_1: any;
    private saveInteractiveNodes;
    private getInteractiveNodes;

    constructor(props) {
        super(props);
        this.id = _.uniqueId("candle-stick-chart-");

        this.onKeyPress = this.onKeyPress.bind(this);
        this.onTrendLineComplete = this.onTrendLineComplete.bind(this);
        this.handleSelection = this.handleSelection.bind(this);

        this.saveInteractiveNodes = saveInteractiveNodes.bind(this);
        this.getInteractiveNodes = getInteractiveNodes.bind(this);

        this.state = {
            trends_1: []
        };
        this.trendRef = React.createRef();
        this.canvasNode = React.createRef();
    }

    componentDidMount = () => {
        document.addEventListener("keyup", this.onKeyPress);
    };

    componentWillUnmount = () => {
        document.removeEventListener("keyup", this.onKeyPress);
    };

    onKeyPress = (e) => {
        if (!isCurrentChartInteractingId(this.id)) return;

        const {onEnableTrendLine, needSave} = this.props;
        const keyCode = e.which;
        // console.log(keyCode);

        switch (keyCode) {
            case 46: { // DEL
                const {trends_1} = this.state;

                needSave({
                    save: trends_1.filter(each => !each.selected).map(this.mapChartTrendToTrendLine),
                    delete: trends_1.filter(each => each.selected).map(this.mapChartTrendToTrendLine)
                });
                // this.canvasNode.cancelDrag();
                break;
            }
            case 27: { // ESC
                // this.node_1.terminate();
                // this.canvasNode.cancelDrag();
                onEnableTrendLine(false);
                break;
            }
            case 68:   // D - Draw trendline
            case 69: { // E - Enable trendline
                onEnableTrendLine(true);
                break;
            }
        }
    };

    mapChartTrendToTrendLine = (trend: ChartTrendLine): TrendLineDto => {
        const {data} = this.props;
        const startCandle = data[trend.start[0]];
        const endCandle = data[trend.end[0]];

        trend.start[1] = this.getSnapPrice(trend.start[1], startCandle);
        trend.end[1] = this.getSnapPrice(trend.end[1], endCandle);

        return {
            id: trend.id,
            secCode: startCandle.symbol,
            interval: startCandle.interval,
            start: trend.start[1],
            startTimestamp: startCandle.timestamp,
            end: trend.end[1],
            endTimestamp: endCandle.timestamp
        };
    };

    onTrendLineStart = (a: any) => {
        // this gets called on
        // 1. draw complete of trendline
        // 2. drag complete of trendline
        console.log("onTrendLineStart: ", a);
    };

    onTrendLineComplete = (trends_1: ChartTrendLine[]) => {
        const {onEnableTrendLine, data, needSave} = this.props;

        // this gets called on
        // 1. draw complete of trendline
        // 2. drag complete of trendline
        console.log(trends_1);
        const storeData: StoreData<TrendLineDto[]> = {
            save: []
        };
        for (const trend of trends_1) {
            storeData.save.push(this.mapChartTrendToTrendLine(trend));
        }
        onEnableTrendLine(false);
        needSave(storeData);
    };

    getSnapPrice = (price: number, candle: Candle) => {
        const mid = candle.low + ((candle.high - candle.low) / 2);
        if (price > mid) {
            return candle.high;
        } else if (price < mid) {
            return candle.low;
        }
        return price;
    };

    handleSelection = (interactives) => {
        const state = toObject(interactives, each => {
            return [
                `trends_${each.chartId}`,
                each.objects,
            ];
        });
        this.setState(state);
    };

    static getDerivedStateFromProps(props, state) {
        // Any time the current user changes,
        // Reset any parts of state that are tied to that user.
        // In this simple example, that's just the email.
        if (props.trends !== state.trends_1) {
            const trends = props.trends;
            const trends_1 = state.trends_1;
            let update = trends_1.length !== trends.length;
            if (!update) {
                for (let i = 0; i < trends.length; i++) {
                    const trendStartEndSum = trends_1[i].start[1] + trends_1[i].end[1]
                        + trends_1[i].start[0] + trends_1[i].end[0];
                    const trendLineStartEndSum = trends[i].start[1] + trends[i].end[1]
                        + trends[i].start[0] + trends[i].end[0];
                    if (trendStartEndSum !== trendLineStartEndSum) {
                        update = true;
                    }
                    trends[i].selected = trends_1[i].selected;
                }
            }

            if (update) {
                return {
                    trends_1: props.trends
                };
            }
        }
        return null;
    }

    render() {
        const {
            type, data: initialData, width, ratio, chartHeight, htSRLevels, orders, stops,
            swingHighsLows, showGrid, zones, candlePatternsUp, candlePatternsDown, scale, srLevels
        } = this.props;
        const {trends_1} = this.state;

        const volumeHeight = 100;
        const height = chartHeight || 500;
        const margin = {left: 50, right: 50, top: 10, bottom: 30};
        const gridHeight = height - margin.top - margin.bottom;
        const xGrid = showGrid ? {
            innerTickSize: -1 * gridHeight,
            // tickStrokeDasharray: 'Solid',
            tickStrokeOpacity: 0.2,
            tickStrokeWidth: 1
        } : {};

        const ema7 = ema()
            .id(0)
            .stroke("#f44336")
            .options({windowSize: 7})
            .merge((d, c) => {
                d.ema7 = c;
            })
            .accessor(d => d.ema7);

        const ema20 = ema()
            .id(1)
            .stroke("#3f51b5")
            .options({windowSize: 20})
            .merge((d, c) => {
                d.ema20 = c;
            })
            .accessor(d => d.ema20);

        const calculatedData = ema20(ema7(initialData));
        const xScaleProvider = discontinuousTimeScaleProvider
            .inputDateAccessor(d => d.timestamp);
        const {
            data,
            xScale,
            xAccessor,
            displayXAccessor,
        } = xScaleProvider(calculatedData);

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
            <div id={this.id} onClick={(e) => setCurrentChartInteractingId(this.id)}>
                <ChartCanvas ref={this.canvasNode}
                             height={height}
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
                           height={volumeHeight}
                           origin={(w, h) => [0, h - volumeHeight]}>
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
                           yExtents={[d => [d.high, d.low], ema20.accessor(), ema7.accessor()]}
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

                        <ChartZones zones={zones}/>
                        <ChartLevels srLevels={srLevels}/>
                        <ChartSwingHighsLows swingHighsLows={swingHighsLows}/>

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

                        <LineSeries yAccessor={ema20.accessor()} stroke={ema20.stroke()}/>
                        <LineSeries yAccessor={ema7.accessor()} stroke={ema7.stroke()}/>

                        <TrendLine ref={this.saveInteractiveNodes("Trendline", 1)}
                                   enabled={this.props.enableTrendLine}
                                   type="RAY"
                                   snap={true}
                                   snapTo={d => [d.high, d.low]}
                                   onStart={this.onTrendLineStart}
                                   onComplete={this.onTrendLineComplete}
                                   trends={trends_1}
                        />

                    </Chart>
                    <CrossHairCursor/>
                    <DrawingObjectSelector
                        enabled={!this.props.enableTrendLine}
                        getInteractiveNodes={this.getInteractiveNodes}
                        drawingObjectMap={{
                            Trendline: "trends"
                        }}
                        onSelect={this.handleSelection}
                    />
                </ChartCanvas>
            </div>
        );
    }
}
