import * as React from "react";
import {format} from "d3-format";
import {timeFormat} from "d3-time-format";

import {Chart, ChartCanvas} from "react-financial-charts";
import {BarSeries, CandlestickSeries, LineSeries, ScatterSeries, Square,} from "react-financial-charts/lib/series";
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
import {head, last, toObject} from "react-financial-charts/lib/utils";
import {ChartDrawType} from "./data/ChartDrawType";
import {Candle} from "../../data/Candle";
import {ChartLevel} from "./data/ChartLevel";
import {SRZone} from "../../data/strategy/SRZone";
import ChartZones from "./components/ChartZones";
import {Interval} from "../../data/Interval";
import {SRLevel} from "../../data/strategy/SRLevel";
import {ChartLevels} from "./components/ChartLevels";
import {DrawingObjectSelector, InteractiveYCoordinate, TrendLine} from "react-financial-charts/lib/interactive";
import {atr, ema} from "react-financial-charts/lib/indicator";
import {
    getInteractiveNodes,
    isCurrentChartInteractingId,
    saveInteractiveNodes,
    setCurrentChartInteractingId,
} from "./utils/interactiveutils";
import {TrendLineDto} from "../../data/TrendLineDto";
import {round, StoreData} from "../../utils/utils";
import {ChartTrendLine} from "./data/ChartTrendLine";
import {TrendWrapper} from "../../data/TrendWrapper";
import {ChartTrades} from "./components/ChartTrades";
import {Trade} from "../../data/Trade";
import {ChartDialog} from "./components/ChartDialog";
import {getMorePropsForChart} from "react-financial-charts/lib/interactive/utils";
import {Security} from "../../data/Security";
import {Order} from "../../data/Order";
import {StopOrder} from "../../data/StopOrder";
import {OperationType} from "../../data/OperationType";
import {ChartManageOrder} from "./data/ChartManageOrder";
import {ActiveTrade} from "../../data/ActiveTrade";
import {KeltnerChannelSeries} from "./components/keltner-channel/KeltnerChannelSeries";

const _ = require("lodash");

type Props = {
    data: Candle[]
    width?: any
    ratio?: any
    chartHeight?: number
    type: ChartDrawType
    htSRLevels?: ChartLevel[]
    stops?: StopOrder[]
    orders?: Order[]
    trades?: Trade[]
    activeTrade?: ActiveTrade
    zones?: SRZone[]
    srLevels?: SRLevel[]
    candlePatternsUp?: any
    candlePatternsDown?: any
    swingHighsLows?: TrendWrapper[]
    showGrid?: boolean
    securityInfo: Security
    enableTrendLine: boolean
    onEnableTrendLine: (enableTrendLine: boolean) => void
    needSave: (storeData: StoreData<TrendLineDto[]>) => void
    trends: ChartTrendLine[]
    onManageOrder: (manageOrder: ChartManageOrder) => void
    enableNewOrder: boolean
    onEnableNewOrder: (enableNewOrder: boolean) => void
};

type State = {
    trends_1: ChartTrendLine[],
    yCoordinateList_1: any[],
    yCoordinateList_3: any[],
    showModal: boolean,
    alertToEdit: any,
    originalAlertList: any[]
    interactiveOrderMap: any
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
        this.onDragComplete = this.onDragComplete.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.handleChoosePosition = this.handleChoosePosition.bind(this);

        this.onTrendLineComplete = this.onTrendLineComplete.bind(this);
        this.handleSelection = this.handleSelection.bind(this);

        this.saveInteractiveNodes = saveInteractiveNodes.bind(this);
        this.getInteractiveNodes = getInteractiveNodes.bind(this);
        this.handleDoubleClickAlert = this.handleDoubleClickAlert.bind(this);

        this.state = {
            trends_1: [],
            yCoordinateList_1: [],
            yCoordinateList_3: [],
            showModal: false,
            alertToEdit: {},
            originalAlertList: [],
            interactiveOrderMap: {}
        };
        this.trendRef = React.createRef();
        this.canvasNode = React.createRef();
    }

    componentDidMount = () => {
        document.addEventListener("keyup", this.onKeyPress)
    }

    componentWillUnmount = () => {
        document.removeEventListener("keyup", this.onKeyPress)
    }

    static getDerivedStateFromProps = (props: Props, state: State) => {
        // Any time the current user changes,
        // Reset any parts of state that are tied to that user.
        // In this simple example, that's just the email.
        if (props.trends !== state.trends_1) {
            const trends = props.trends
            const trends_1 = state.trends_1
            let update = trends_1.length !== trends.length
            if (!update) {
                for (let i = 0; i < trends.length; i++) {
                    const trendStartEndSum = trends_1[i].start[1] + trends_1[i].end[1]
                        + trends_1[i].start[0] + trends_1[i].end[0]
                    const trendLineStartEndSum = trends[i].start[1] + trends[i].end[1]
                        + trends[i].start[0] + trends[i].end[0]
                    if (trendStartEndSum !== trendLineStartEndSum) {
                        update = true;
                    }
                    trends[i].selected = trends_1[i].selected
                }
            }

            if (update) {
                return {
                    trends_1: props.trends
                }
            }
        }

        if (props.orders && props.stops && Object.keys(state.interactiveOrderMap).length !== (props.orders.length + props.stops.length)
            || props.orders && props.orders.some(order => !state.interactiveOrderMap[order.orderNum])
            || props.stops && props.stops.some(stop => !state.interactiveOrderMap[stop.transId])) {
            return CandleStickChartForDiscontinuousIntraDay.getInteractiveOrderMap(
                props.orders, props.stops, state.yCoordinateList_1)
        }

        return null
    }

    static getInteractiveOrderMap = (orders, stops, yCoordinateList_1: any[]): any => {
        const interactiveOrderMap = {}

        if (orders) {
            for (const order of orders) {
                if (OperationType.BUY === order.operation) {
                    interactiveOrderMap[order.orderNum] = {
                        interactiveYCoordinateItem: {
                            ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
                            stroke: "#1F9D55",
                            textFill: "#1F9D55",
                            text: "Buy " + order.quantity,
                            edge: {
                                ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate.edge,
                                stroke: "#1F9D55"
                            },
                            yValue: order.price,
                            id: "order_" + order.orderNum,
                            draggable: true
                        },
                        type: 'order',
                        orderOrStop: order
                    }
                } else {
                    interactiveOrderMap[order.orderNum] = {
                        interactiveYCoordinateItem: {
                            ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
                            stroke: "#E3342F",
                            textFill: "#E3342F",
                            text: "Sell " + order.quantity,
                            edge: {
                                ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate.edge,
                                stroke: "#E3342F"
                            },
                            yValue: order.price,
                            id: "order_" + order.orderNum,
                            draggable: true
                        },
                        type: 'order',
                        orderOrStop: order
                    }
                }
            }
        }

        if (stops) {
            for (const stop of stops) {
                interactiveOrderMap[stop.transId] = {
                    interactiveYCoordinateItem: {
                        ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
                        textFill: stop.operation === OperationType.BUY ? "#1F9D55" : "#E3342F",
                        text: (stop.operation === OperationType.BUY ? "Stop Buy " : "Stop Sell ") + stop.quantity,
                        yValue: stop.conditionPrice,
                        id: "stop_" + stop.transId,
                        draggable: true
                    },
                    type: 'stop',
                    orderOrStop: stop
                }
            }
        }

        const interactiveOrders = Object.values(interactiveOrderMap)
        // const list = yCoordinateList_1.filter(value => value.id.startsWith('alert_'))
        const list = []
        for (const interOrder of interactiveOrders) {
            list.push(interOrder['interactiveYCoordinateItem'])
        }

        return {
            interactiveOrderMap,
            yCoordinateList_1: list
        }
    }

    getOrderAndStopMap = _.memoize((orders: Order[], stops: StopOrder[]) => {
        const map = {}
        if (orders && orders.length > 0) {
            for (const order of orders) {
                map["order_" + order.orderNum] = order
            }
        }
        if (stops && stops.length > 0) {
            for (const stop of stops) {
                map["stop_" + stop.transId] = stop
            }
        }
        return map
    })

    onKeyPress = (e) => {
        if (!isCurrentChartInteractingId(this.id)) return;

        const {onEnableTrendLine, needSave, onEnableNewOrder} = this.props;
        const keyCode = e.which;
        // console.log(keyCode);

        switch (keyCode) {
            case 46: { // DEL
                const {trends_1, yCoordinateList_1} = this.state;

                if (trends_1.some(each => each.selected)) {
                    needSave({
                        save: trends_1.filter(each => !each.selected).map(this.mapChartTrendToTrendLine),
                        delete: trends_1.filter(each => each.selected).map(this.mapChartTrendToTrendLine)
                    })
                }

                if (yCoordinateList_1.some(each => each.selected)) {
                    const selectedOrder = yCoordinateList_1.find(d => {
                        return d.selected
                    })
                    this.deleteOrderView(selectedOrder.id)
                }
                // this.canvasNode.cancelDrag();
                break;
            }
            case 27: { // ESC
                // this.node_1.terminate();
                // this.canvasNode.cancelDrag();
                onEnableTrendLine(false)
                onEnableNewOrder(false)
                break
            }
            case 84: { // T - Enable trendline
                onEnableTrendLine(true)
                break
            }
            case 81: { // Q - Enable NewOrder
                onEnableNewOrder(true)
                break
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
            secId: startCandle.secId,
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

    handleSelection = (interactives, moreProps, e) => {
        if (interactives[0].type === "Trendline") {
            const state = toObject([interactives[0]], each => {
                return [
                    `trends_${each.chartId}`,
                    each.objects
                ]
            })
            this.setState(state)
        }

        if (interactives[1].type === "InteractiveYCoordinate") {
            if (this.props.enableNewOrder) {
                const independentCharts = moreProps.currentCharts.filter(d => d !== 2);
                if (independentCharts.length > 0) {
                    const first = head(independentCharts);

                    const morePropsForChart = getMorePropsForChart(moreProps, first);
                    const {
                        mouseXY: [, mouseY],
                        chartConfig: {yScale},
                    } = morePropsForChart;

                    const yValue = round(yScale.invert(mouseY), 2);
                    const newAlert = {
                        ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
                        stroke: "#777",
                        textFill: "#777",
                        text: "Preview Alert",
                        edge: {
                            ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate.edge,
                            stroke: "#777"
                        },
                        yValue,
                        id: _.uniqueId('alert_'),
                        draggable: true
                    };
                    this.handleChoosePosition(newAlert, morePropsForChart, e);
                    setTimeout(() => {
                        this.setState({
                            showModal: true,
                            alertToEdit: {
                                alert: newAlert,
                                chartId: morePropsForChart.chartConfig.id,
                            }
                        })
                    }, 200)
                }
            } else {
                const state = toObject([interactives[1]], each => {
                    return [
                        `yCoordinateList_${each.chartId}`,
                        each.objects
                    ]
                })
                this.setState(state);
            }
        }
    };

    handleChoosePosition = (alert, moreProps, e) => {
        const {onEnableNewOrder} = this.props
        const {id: chartId} = moreProps.chartConfig;
        this.setState({
            yCoordinateList_1: [
                ...this.state.yCoordinateList_1,
                alert
            ]
        })
        onEnableNewOrder(false)
    }

    handleDoubleClickAlert = (item) => {
        if (item.type === 'Trendline') {

        } else if (item.type === 'InteractiveYCoordinate') {
            this.setState({
                showModal: true,
                alertToEdit: {
                    alert: item.object,
                    chartId: item.chartId,
                },
            });
        }
    }

    handleChangeAlert = (alert, chartId, manageOrder: ChartManageOrder) => {
        const {onEnableNewOrder, onManageOrder} = this.props
        const {yCoordinateList_1} = this.state;
        const newAlertList = yCoordinateList_1.map(d => {
            return d.id === alert.id ? alert : d;
        });

        this.setState({
            yCoordinateList_1: newAlertList,
            showModal: false
        })
        onEnableNewOrder(false)
        onManageOrder(manageOrder)
    }

    handleDeleteAlert = () => {
        const {alertToEdit, yCoordinateList_1} = this.state

        if (alertToEdit.alert.id.startsWith("alert_")) {
            this.setState({
                showModal: false,
                alertToEdit: {},
                yCoordinateList_1: yCoordinateList_1.filter(d => {
                    return d.id !== alertToEdit.alert.id;
                })
            })
        } else {
            const deleteAlert = yCoordinateList_1.find(d => {
                return d.id === alertToEdit.alert.id;
            })

            deleteAlert.stroke = "#777"
            deleteAlert.textFill = "#E3342F"
            deleteAlert.text = "Delete: " + deleteAlert.text
            deleteAlert.edge.stroke = "#777"

            this.setState({
                showModal: false,
                alertToEdit: {},
                yCoordinateList_1: [...yCoordinateList_1]
            })

            this.deleteOrder(alertToEdit.alert.id)
        }
    }

    handleDialogClose = () => {
        // cancel alert edit
        const {originalAlertList, alertToEdit} = this.state;

        const key = `yCoordinateList_${alertToEdit.chartId}`;
        const list = originalAlertList || this.state[key];

        this.setState({
            showModal: false,
            yCoordinateList_1: list
        })
    }

    onDelete = (yCoordinate, moreProps?) => {
        this.deleteOrderView(yCoordinate.id)
    }

    onDragComplete = (yCoordinateList, moreProps, draggedAlert) => {
        // this gets called on drag complete of drawing object
        const {onEnableNewOrder} = this.props
        const {id: chartId} = moreProps.chartConfig

        const key = `yCoordinateList_${chartId}`
        const alertDragged = draggedAlert != null

        this.setState({
            yCoordinateList_1: yCoordinateList,
            showModal: alertDragged,
            alertToEdit: {
                alert: draggedAlert,
                chartId,
            },
            originalAlertList: this.state[key]
        })
        onEnableNewOrder(false)
    }

    deleteOrderView = (interactiveOrderId: string) => {
        const {yCoordinateList_1} = this.state

        if (interactiveOrderId.startsWith("alert_")) {
            this.setState({
                yCoordinateList_1: yCoordinateList_1.filter(d => {
                    return d.id !== interactiveOrderId
                })
            })
        } else {
            const deleteAlert = yCoordinateList_1.find(d => {
                return d.id === interactiveOrderId
            })

            deleteAlert.stroke = "#777"
            deleteAlert.textFill = "#E3342F"
            deleteAlert.text = "Delete: " + deleteAlert.text
            deleteAlert.edge.stroke = "#777"

            this.setState({
                yCoordinateList_1: [...yCoordinateList_1]
            })

            this.deleteOrder(interactiveOrderId)
        }
    }

    deleteOrder = (interactiveOrderId: string) => {
        const {orders, stops} = this.props
        const orderAndStopMap = this.getOrderAndStopMap(orders, stops)

        const cancelOrder = interactiveOrderId.startsWith("order_") ? orderAndStopMap[interactiveOrderId] : null
        const cancelStopOrder = interactiveOrderId.startsWith("stop_") ? orderAndStopMap[interactiveOrderId] : null

        if (cancelOrder) {
            this.props.onManageOrder({
                type: "order",
                cancelOrder
            })
        }

        if (cancelStopOrder) {
            this.props.onManageOrder({
                type: "stop",
                cancelStopOrder
            })
        }
    }

    render() {
        const {
            type, data: initialData, width, ratio, chartHeight, htSRLevels, orders, trades, stops,
            swingHighsLows, showGrid, zones, candlePatternsUp, candlePatternsDown, securityInfo, srLevels,
            enableNewOrder, activeTrade
        } = this.props;
        const {trends_1, showModal, alertToEdit} = this.state;
        const scale = securityInfo ? securityInfo.scale : 4
        const scaleFormat = `.${scale}s`

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

        const atr7 = atr()
            .options({windowSize: 7})
            .merge((d, c) => {
                d.atr7 = c;
            })
            .accessor(d => d.atr7);

        const calculatedData = ema20(ema7(atr7(initialData)));
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
                            displayFormat={format(scaleFormat)}/>

                        <BarSeries yAccessor={d => d.volume} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"}/>

                        <CurrentCoordinate yAccessor={d => d.volume} fill="#9B0A47"/>

                        <EdgeIndicator itemType="last" orient="right" edgeAt="right"
                                       yAccessor={d => d.volume}
                                       displayFormat={format(scaleFormat)}
                                       fill="#0F0F0F"/>
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

                        <ChartZones zones={zones} scale={scale}/>
                        <ChartLevels srLevels={srLevels} scale={scale}/>
                        {/*<ChartSwingHighsLows swingHighsLows={swingHighsLows}/>*/}

                        <CandlestickSeries fill={(d) => d.close > d.open ? "#ecf0f1" : "#000"}
                                           stroke="#000"
                                           wickStroke="#000"/>
                        <EdgeIndicator itemType="last" orient="right" edgeAt="right"
                                       yAccessor={d => d.close}
                                       displayFormat={format(`.${scale}f`)}
                                       fill={d => d.close > d.open ? "#6BA583" : "#FF0000"}/>

                        <OHLCTooltip origin={[-40, 0]} xDisplayFormat={timeFormat("%Y-%m-%d %H:%M:%S")}/>

                        {htSRLevelsView}
                        {
                            activeTrade ?
                                <PriceCoordinate
                                    at="right"
                                    orient="right"
                                    price={activeTrade.avgPrice}
                                    stroke={"#0000FF"}
                                    lineStroke={"#0000FF"}
                                    lineOpacity={1}
                                    strokeWidth={1}
                                    fontSize={12}
                                    fill={"#0000FF"}
                                    arrowWidth={7}
                                    displayFormat={format(formatInput)}
                                />
                                : null
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

                        <KeltnerChannelSeries yAccessor={d => ({ema: ema20.accessor(), atr: atr7.accessor()})}/>
                        {/*<LineSeries yAccessor={ema20.accessor()} stroke={ema20.stroke()}/>*/}
                        <LineSeries yAccessor={ema7.accessor()} stroke={ema7.stroke()}/>

                        <ChartTrades candles={data} trades={trades}/>

                        <TrendLine ref={this.saveInteractiveNodes("Trendline", 1)}
                                   enabled={this.props.enableTrendLine}
                                   type="RAY"
                                   snap={true}
                                   snapTo={d => [d.high, d.low]}
                                   onStart={this.onTrendLineStart}
                                   onComplete={this.onTrendLineComplete}
                                   trends={trends_1}
                        />

                        <InteractiveYCoordinate
                            ref={this.saveInteractiveNodes("InteractiveYCoordinate", 1)}
                            enabled={enableNewOrder}
                            onDragComplete={this.onDragComplete}
                            onDelete={this.onDelete}
                            yCoordinateList={this.state.yCoordinateList_1}
                        />

                    </Chart>
                    <CrossHairCursor/>
                    <DrawingObjectSelector
                        enabled={!(this.props.enableTrendLine && this.props.enableNewOrder)}
                        getInteractiveNodes={this.getInteractiveNodes}
                        drawingObjectMap={{
                            Trendline: "trends",
                            InteractiveYCoordinate: "yCoordinateList"
                        }}
                        onSelect={this.handleSelection}
                        onDoubleClick={this.handleDoubleClickAlert}
                    />
                </ChartCanvas>
                <ChartDialog
                    securityInfo={securityInfo}
                    stops={stops}
                    orders={orders}
                    showModal={showModal}
                    alert={alertToEdit.alert}
                    chartId={alertToEdit.chartId}
                    onClose={this.handleDialogClose}
                    onSave={this.handleChangeAlert}
                    onDeleteAlert={this.handleDeleteAlert}
                />
            </div>
        );
    }
}
