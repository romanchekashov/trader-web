import * as React from "react";
import {getCandles} from "../../api/rest/traderRestApi";
import {Interval} from "../../data/Interval";
import {CandleStickChartForDiscontinuousIntraDay} from "./CandleStickChartForDiscontinuousIntraDay";
import {ChartDrawType} from "./data/ChartDrawType";
import {Candle} from "../../data/Candle";
import {SecurityLastInfo} from "../../data/SecurityLastInfo";
import {TradePremise} from "../../data/strategy/TradePremise";
import {ChartElementAppearance} from "./data/ChartElementAppearance";
import {ChartLevel} from "./data/ChartLevel";
import {Order} from "../../data/Order";
import {OperationType} from "../../data/OperationType";
import {getHistoryCandles} from "../../api/rest/historyRestApi";
import {Trend} from "../../data/strategy/Trend";
import {ActiveTrade} from "../../data/ActiveTrade";
import {WebsocketService, WSEvent} from "../../api/WebsocketService";
import {SubscriptionLike} from "rxjs";
import {PatternResult} from "../alerts/data/PatternResult";
import "./ChartWrapper.css";
import {Dropdown} from "primereact/dropdown";
import {Security} from "../../data/Security";
import {getSecurity} from "../../utils/Cache";
import {IntervalColor, Intervals, PrimeDropdownItem, StoreData} from "../../utils/utils";
import {ToggleButton} from "primereact/togglebutton";
import {TrendLineDto} from "../../data/TrendLineDto";
import {getTrendLines, saveTrendLines} from "../../api/rest/TrendLineRestApi";
import {Button} from "primereact/button";
import {ChartTrendLine} from "./data/ChartTrendLine";
import {ChartTrendLineType} from "./data/ChartTrendLineType";
import {TrendPoint} from "../../data/strategy/TrendPoint";
import moment = require("moment");

type Props = {
    interval: Interval,
    onIntervalChanged: (interval: Interval) => void
    width: number,
    initialNumberOfCandles?: number,
    security: SecurityLastInfo
    premise?: TradePremise
    orders?: Order[]
    history?: boolean
    trend?: Trend
    showGrid?: boolean
    activeTrade?: ActiveTrade
    alert?: PatternResult
};

type States = {
    candles: Candle[],
    numberOfCandles: number,
    nodata: boolean
    secCode: string
    innerInterval: Interval
    enableTrendLine: boolean
    needSave: boolean
    showSRLevels: boolean
    showSRZones: boolean
    storeData: StoreData<TrendLineDto[]>
    trendLines: TrendLineDto[]
    trends_1: ChartTrendLine[]
};

export class ChartWrapper extends React.Component<Props, States> {

    private candlesSetupSubscription: SubscriptionLike = null;
    private wsStatusSub: SubscriptionLike = null;
    private fetchingCandles: boolean = false;
    private intervals: PrimeDropdownItem<Interval>[] = Intervals.map(val => ({label: val, value: val}));
    private securityInfo: Security;
    private initialStateTrendLines: TrendLineDto[] = [];
    private chartTrendLineDefaultAppearance: ChartElementAppearance = {
        edgeFill: "#FFFFFF",
        edgeStroke: "#000000",
        edgeStrokeWidth: 1,
        r: 6,
        stroke: "#000000",
        strokeDasharray: "Solid",
        strokeOpacity: 1,
        strokeWidth: 1
    };

    constructor(props) {
        super(props);
        const {interval, initialNumberOfCandles} = props;

        this.state = {
            candles: [], nodata: false, secCode: null, innerInterval: interval, enableTrendLine: false, needSave: false,
            storeData: null, trendLines: [], trends_1: [], showSRLevels: true, showSRZones: true,
            numberOfCandles: initialNumberOfCandles || 500
        };
    }

    getNewCandles = (security: SecurityLastInfo, interval: Interval): Promise<Candle[]> => {
        const {history} = this.props;
        const {numberOfCandles} = this.state;
        if (history) {
            return getHistoryCandles(security.classCode, security.secCode, interval, numberOfCandles);
        } else {
            return getCandles(security.classCode, security.secCode, interval, numberOfCandles);
        }
    };

    updateCandles = (candles: Candle[], security: SecurityLastInfo) => {
        if (candles && candles.length === 1) {
            this.setState({
                candles: [],
                nodata: true
            })
        } else {
            const {trendLines} = this.state;

            this.setState({
                candles,
                nodata: false,
                trends_1: this.mapTrendLinesFromPropsToState(trendLines, candles)
            });
            this.requestCandles(security);
        }
    };

    fetchCandles = (security: SecurityLastInfo, interval: Interval) => {
        if (security && !this.fetchingCandles) {
            let setIntervalIdForFetchCandles: NodeJS.Timeout = null;
            this.fetchingCandles = true;
            this.setState({
                candles: []
            });
            this.securityInfo = getSecurity(security.classCode, security.secCode);

            this.getNewCandles(security, interval)
                .then(data => {
                    this.updateCandles(
                        data.map(c => {
                            c.timestamp = new Date(c.timestamp);
                            return c;
                        }), security);
                    this.fetchingCandles = false;
                })
                .catch(reason => {
                    this.fetchingCandles = false;
                    this.fetchCandles(security, interval);
                });
        }
    };

    componentDidMount = () => {

        this.candlesSetupSubscription = WebsocketService.getInstance()
            .on<Candle[]>(WSEvent.CANDLES).subscribe(lastCandles => {
                const {innerInterval, candles, trendLines} = this.state;
                if (candles.length > 2 && lastCandles.length > 0 && innerInterval === lastCandles[0].interval) {
                    const candlesIndexMap = {};
                    let newCandles = null;
                    let needUpdateTrendLines = false;
                    candlesIndexMap[candles[candles.length - 2].timestamp.getTime()] = candles.length - 2;
                    candlesIndexMap[candles[candles.length - 1].timestamp.getTime()] = candles.length - 1;

                    for (const candle of lastCandles) {
                        candle.timestamp = new Date(candle.timestamp);
                        const index = candlesIndexMap[candle.timestamp.getTime()];
                        if (index) {
                            candles[index] = candle;
                        } else {
                            newCandles = candles.slice(1);
                            newCandles.push(candle);
                            needUpdateTrendLines = true;
                        }
                    }

                    newCandles = newCandles ? newCandles : [...candles];

                    if (needUpdateTrendLines) {
                        this.setState({
                            candles: newCandles,
                            trends_1: this.mapTrendLinesFromPropsToState(trendLines, newCandles)
                        });
                    } else {
                        this.setState({candles: newCandles});
                    }
                }
            });

        this.wsStatusSub = WebsocketService.getInstance().connectionStatus()
            .subscribe(isConnected => {
                if (isConnected) {
                    this.requestCandles(this.props.security);
                }
            });

        const {security, interval} = this.props;
        this.fetchCandles(security, interval);
        this.fetchTrendLines(interval);
    };

    componentDidUpdate = (prevProps) => {
        const {security, interval} = this.props;
        const {candles, innerInterval} = this.state;
        if (security) {
            if (!this.fetchingCandles) {
                if (!prevProps.security || candles.length === 0 || security.secCode !== prevProps.security.secCode) {
                    this.fetchCandles(security, innerInterval);
                }
                if (prevProps.security && security.priceLastTrade !== prevProps.security.priceLastTrade) {
                    this.updateLastCandle();
                }
            }
        }

        if (interval !== innerInterval) {
            this.setState({innerInterval: interval});
        }
    };

    fetchTrendLines = (interval: Interval): void => {
        const {security} = this.props;
        getTrendLines({
            classCode: security.classCode,
            secCode: security.secCode,
            interval
        }).then(this.setTrendLinesFromServer).catch(console.error);
    };

    setTrendLinesFromServer = (trendLines: TrendLineDto[]): void => {
        const {candles} = this.state;
        for (const t of trendLines) {
            t.startTimestamp = new Date(t.startTimestamp);
            t.endTimestamp = new Date(t.endTimestamp);
        }
        this.initialStateTrendLines = trendLines;
        this.setState({
            trendLines,
            trends_1: this.mapTrendLinesFromPropsToState(trendLines, candles)
        });
    };

    mapTrendLinesFromPropsToState = (trendLines: TrendLineDto[], candles: Candle[]): ChartTrendLine[] => {
        const {innerInterval} = this.state;
        this.chartTrendLineDefaultAppearance.stroke = IntervalColor[innerInterval] || "#000000";
        this.chartTrendLineDefaultAppearance.edgeStroke = IntervalColor[innerInterval] || "#000000";

        const newTrends: ChartTrendLine[] = [];

        for (const t of trendLines) {
            const startIndex = candles.findIndex(value => value.timestamp.getTime() === t.startTimestamp.getTime());
            const endIndex = candles.findIndex(value => value.timestamp.getTime() === t.endTimestamp.getTime());
            if (startIndex > -1 && endIndex > -1) {
                newTrends.push({
                    start: [startIndex, t.start],
                    end: [endIndex, t.end],
                    selected: false,
                    type: ChartTrendLineType.RAY,
                    appearance: this.chartTrendLineDefaultAppearance,
                    id: t.id
                });
            }
        }
        return newTrends;
    };

    componentWillUnmount = (): void => {
        this.candlesSetupSubscription.unsubscribe();
        this.wsStatusSub.unsubscribe();
    };

    updateLastCandle = () => {
        const {security} = this.props;
        const {candles} = this.state;

        const lastCandle = candles[candles.length - 1];
        if (lastCandle) {
            if (security.priceLastTrade > lastCandle.high) {
                lastCandle.high = security.priceLastTrade
            } else if (security.priceLastTrade < lastCandle.low) {
                lastCandle.low = security.priceLastTrade
            }
            lastCandle.close = security.priceLastTrade;
            lastCandle.volume += security.quantityLastTrade;
            this.setState({candles: [...candles], nodata: false});
        }
    };

    requestCandles = (security: SecurityLastInfo): void => {
        const {innerInterval} = this.state;

        if (security && innerInterval) {
            WebsocketService.getInstance().send(WSEvent.GET_CANDLES, {
                classCode: security.classCode,
                secCode: security.secCode,
                interval: innerInterval,
                numberOfCandles: 2
            });
        }
    };

    static mapChartSRLevels = (levels: number[], appearance: ChartElementAppearance): ChartLevel[] => {
        const lines = [];
        const MAX_COUNT = 4;

        for (let i = 0; i < levels.length; i++) {
            if (i === MAX_COUNT) break;

            const line = new ChartLevel();
            line.price = levels[i];
            line.appearance = appearance;

            lines.push(line);
        }

        return lines;
    };

    getHighTimeFrameSRLevels = () => {
        // const {premise} = this.props;
        //
        // if (premise && premise.analysis.htSRLevels) {
        //     const resistanceLevels = premise.analysis.htSRLevels.resistanceLevels;
        //     const supportLevels = premise.analysis.htSRLevels.supportLevels;
        //     return [
        //         ...ChartWrapper.mapChartSRLevels(resistanceLevels, {stroke: "red"}),
        //         ...ChartWrapper.mapChartSRLevels(supportLevels, {stroke: "green"})
        //     ];
        // }
        return [];
    };

    getOrdersLevels = () => {
        const {orders} = this.props;

        if (orders) {
            return [
                ...ChartWrapper.mapChartSRLevels(orders
                    .filter(value => OperationType.SELL === value.operation)
                    .map(value => value.price), {stroke: "red"}),
                ...ChartWrapper.mapChartSRLevels(orders
                    .filter(value => OperationType.SELL !== value.operation)
                    .map(value => value.price), {stroke: "green"})
            ];
        }
        return [];
    };

    getSwingHighsLowsMap = () => {
        const {premise, trend} = this.props;

        let swingHighsLows: TrendPoint[] = null;

        if (premise && premise.analysis.trend) {
            swingHighsLows = premise.analysis.trend.swingHighsLows;
        }

        if (trend) {
            swingHighsLows = trend.swingHighsLows;
        }

        if (swingHighsLows) {
            for (const trendPoint of swingHighsLows) {
                trendPoint.dateTime = moment(trendPoint.dateTime).toDate();
            }
        }

        return swingHighsLows;
    };

    getStops = () => {
        const {activeTrade} = this.props;

        if (activeTrade && activeTrade.stopOrder) {
            return [
                ...ChartWrapper.mapChartSRLevels([activeTrade.stopOrder.price], {stroke: "#3498db"})
            ];
        }
        return [];
    };

    getCandlePatternsUp = () => {
        const {alert} = this.props;

        let map = null;
        if (alert && alert.possibleFutureDirectionUp) {
            map = {};
            map[moment(alert.candle.timestamp).toDate().getTime()] = alert.candle.low;
        }

        return map;
    };

    getCandlePatternsDown = () => {
        const {alert} = this.props;

        let map = null;
        if (alert && !alert.possibleFutureDirectionUp) {
            map = {};
            map[moment(alert.candle.timestamp).toDate().getTime()] = alert.candle.high;
        }

        return map;
    };

    onIntervalChanged = (innerInterval: Interval) => {
        this.fetchTrendLines(innerInterval);
        this.setState({innerInterval});
        this.props.onIntervalChanged(innerInterval);
        const {security} = this.props;
        this.fetchCandles(security, innerInterval);
    };

    onEnableTrendLine = (enableTrendLine: boolean) => {
        this.setState({enableTrendLine});
    };

    onSave = () => {
        const {security} = this.props;
        const {storeData} = this.state;
        if (storeData) {
            console.log(storeData);
            const saving = [];
            if (storeData.save && storeData.save.length > 0) {
                for (const trendLine of storeData.save) {
                    trendLine.classCode = security.classCode;
                    saving.push(trendLine);
                }
            }
            if (storeData.delete && storeData.delete.length > 0) {
                for (const trendLine of storeData.delete) {
                    trendLine.classCode = security.classCode;
                    trendLine.deleted = new Date();
                    saving.push(trendLine);
                }
            }
            if (saving.length > 0) {
                saveTrendLines(saving)
                    .then(this.setTrendLinesFromServer)
                    .catch(console.error);
            }
        }
        this.setState({needSave: false});
    };

    onCancel = () => {
        const {candles} = this.state;

        this.setState({
            needSave: false,
            storeData: null,
            trendLines: this.initialStateTrendLines,
            trends_1: this.mapTrendLinesFromPropsToState(this.initialStateTrendLines, candles)
        });
    };

    onNeedSave = (storeData: StoreData<TrendLineDto[]>): void => {
        const {candles} = this.state;

        const newTrendLines = [];
        if (storeData.save && storeData.save.length > 0) {
            for (const trendLine of storeData.save) {
                newTrendLines.push(trendLine);
            }
        }

        this.setState({
            storeData,
            needSave: true,
            trendLines: newTrendLines,
            trends_1: this.mapTrendLinesFromPropsToState(newTrendLines, candles)
        });
    };

    render() {
        const {candles, nodata, innerInterval, enableTrendLine, needSave, trends_1, showSRLevels, showSRZones} = this.state;

        if (nodata) {
            return <div>No data</div>
        }

        if (candles.length === 0) {
            return <div>Loading...</div>
        }

        const {width, showGrid, premise, security} = this.props;

        return (
            <>
                <div className="chart-wrapper-head">
                    <div className="chart-wrapper-head-security">{security.secCode}</div>
                    <div className="chart-wrapper-head-interval">
                        <Dropdown value={innerInterval} options={this.intervals}
                                  onChange={(e) => {
                                      this.onIntervalChanged(e.value);
                                  }}/>
                    </div>
                    <div className="chart-wrapper-head-trendline">
                        <ToggleButton onLabel="Drawing"
                                      offLabel="Draw Line"
                                      checked={enableTrendLine}
                                      onChange={(e) => this.onEnableTrendLine(e.value)}/>
                    </div>

                    {
                        needSave ?
                            <div className="chart-wrapper-head-trendline">
                                <Button label="Save"
                                        onClick={(e) => this.onSave()}/>
                            </div> : null
                    }

                    {
                        needSave ?
                            <div className="chart-wrapper-head-trendline">
                                <Button label="Cancel" className="p-button-secondary"
                                        onClick={(e) => this.onCancel()}/>
                            </div> : null
                    }

                    <div className="chart-wrapper-head-trendline">
                        <ToggleButton onLabel="SRLevels"
                                      offLabel="SRLevels"
                                      checked={showSRLevels}
                                      onChange={(e) => this.setState({showSRLevels: e.value})}/>
                    </div>
                    <div className="chart-wrapper-head-legends">
                        <div className="chart-wrapper-head-legend" style={{backgroundColor: IntervalColor.MONTH}}>MN
                        </div>
                        <div className="chart-wrapper-head-legend" style={{backgroundColor: IntervalColor.WEEK}}>W</div>
                        <div className="chart-wrapper-head-legend" style={{backgroundColor: IntervalColor.DAY}}>D</div>
                        <div className="chart-wrapper-head-legend" style={{backgroundColor: IntervalColor.H4}}>H4</div>
                        <div className="chart-wrapper-head-legend" style={{backgroundColor: IntervalColor.H2}}>H2</div>
                        <div className="chart-wrapper-head-legend" style={{backgroundColor: IntervalColor.M60}}>M60
                        </div>
                        <div className="chart-wrapper-head-legend" style={{backgroundColor: IntervalColor.M30}}>M30
                        </div>
                    </div>

                    <div className="chart-wrapper-head-trendline">
                        <ToggleButton onLabel="SRZones"
                                      offLabel="SRZones"
                                      checked={showSRZones}
                                      onChange={(e) => this.setState({showSRZones: e.value})}/>
                    </div>

                </div>
                <CandleStickChartForDiscontinuousIntraDay
                    type={ChartDrawType.CANVAS_SVG}
                    data={candles}
                    width={width}
                    ratio={1}
                    htSRLevels={this.getHighTimeFrameSRLevels()}
                    orders={this.getOrdersLevels()}
                    swingHighsLows={this.getSwingHighsLowsMap()}
                    showGrid={showGrid}
                    stops={this.getStops()}
                    zones={premise && showSRZones ? premise.analysis.srZones : null}
                    srLevels={premise && showSRLevels ? premise.analysis.srLevels : null}
                    candlePatternsUp={this.getCandlePatternsUp()}
                    candlePatternsDown={this.getCandlePatternsDown()}
                    scale={this.securityInfo ? this.securityInfo.scale : 0}
                    enableTrendLine={enableTrendLine}
                    onEnableTrendLine={this.onEnableTrendLine}
                    needSave={this.onNeedSave}
                    trends={trends_1}/>
            </>
        )
    }
}