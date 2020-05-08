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
import moment = require("moment");
import {PatternResult} from "../alerts/data/PatternResult";

type Props = {
    interval: Interval,
    width: number,
    numberOfCandles?: number,
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
    nodata: boolean
    secCode: string
};

export class ChartWrapper extends React.Component<Props, States> {

    private candlesSetupSubscription: SubscriptionLike = null;
    private wsStatusSub: SubscriptionLike = null;

    constructor(props) {
        super(props);
        this.state = {
            candles: [], nodata: false, secCode: null
        };
    }

    getNewCandles = (security: SecurityLastInfo): Promise<Candle[]> => {
        const {interval, history} = this.props;
        const numberOfCandles = 500;
        if (history) {
            return getHistoryCandles(security.classCode, security.secCode, interval, numberOfCandles);
        } else {
            return getCandles(security.classCode, security.secCode, interval, numberOfCandles);
        }
    };

    updateCandles = (data: Candle[], security: SecurityLastInfo) => {
        if (data && data.length > 0 && data[0].open === 0) {
            this.setState({
                candles: [],
                nodata: true
            })
        } else {
            this.setState({
                candles: data.map(c => {
                    c.timestamp = new Date(c.timestamp);
                    return c;
                }),
                nodata: false
            });
            this.requestCandles(security);
        }
    };

    fetchCandles = (security: SecurityLastInfo) => {
        if (security) {
            let setIntervalIdForFetchCandles: NodeJS.Timeout = null;

            setIntervalIdForFetchCandles = setInterval(() => {
                this.getNewCandles(security)
                    .then(data => {
                        if (data && data.length > 0) clearInterval(setIntervalIdForFetchCandles);
                        this.updateCandles(data, security);
                    })
                    .catch(console.error);
            }, 2000);
        }
    };

    componentDidMount = () => {

        this.candlesSetupSubscription = WebsocketService.getInstance()
            .on<Candle[]>(WSEvent.CANDLES).subscribe(lastCandles => {
                const {interval} = this.props;
                if (lastCandles && lastCandles.length > 0 && interval === lastCandles[0].interval) {
                    const {candles} = this.state;
                    const candlesIndexMap = {};
                    let newCandles = null;
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
                        }
                    }

                    this.setState({candles: newCandles ? newCandles : [...candles]});
                }
            });

        this.wsStatusSub = WebsocketService.getInstance().connectionStatus()
            .subscribe(isConnected => {
                if (isConnected) {
                    const {security} = this.props;
                    this.requestCandles(security);
                }
            });
    };

    componentWillUnmount = (): void => {
        this.candlesSetupSubscription.unsubscribe();
        this.wsStatusSub.unsubscribe();
    };

    componentWillReceiveProps = (nextProps) => {
        const {security} = this.props;
        const {candles} = this.state;
        if (nextProps.security) {
            if (security) {
                if (candles.length === 0 || security.secCode !== nextProps.security.secCode) {
                    this.fetchCandles(nextProps.security);
                }
                if (security.priceLastTrade !== nextProps.security.priceLastTrade) {
                    this.updateLastCandle();
                }
            } else {
                this.fetchCandles(nextProps.security);
            }
        }
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
        const {interval} = this.props;

        if (security && interval) {
            WebsocketService.getInstance().send(WSEvent.GET_CANDLES, {
                classCode: security.classCode,
                secCode: security.secCode,
                interval,
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

        let swingHighsLowsMap = null;
        let swingHighsLows = null;

        if (premise && premise.analysis.trend) {
            swingHighsLowsMap = {};
            swingHighsLows = premise.analysis.trend.swingHighsLows;
        }

        if (trend) {
            swingHighsLowsMap = {};
            swingHighsLows = trend.swingHighsLows;
        }

        if (swingHighsLows) {
            for (const value of swingHighsLows) {
                swingHighsLowsMap[moment(value.dateTime).toDate().getTime()] = value.swingHL;
            }
        }

        return swingHighsLowsMap;
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

    render() {
        const {candles, nodata} = this.state;

        if (candles.length === 0 && !nodata) {
            return <div>Loading...</div>
        }

        if (nodata) {
            return <div>No data</div>
        }

        const {width, showGrid, premise} = this.props;

        return (
            <CandleStickChartForDiscontinuousIntraDay
                type={ChartDrawType.CANVAS_SVG}
                data={candles}
                width={width}
                ratio={1}
                htSRLevels={this.getHighTimeFrameSRLevels()}
                orders={this.getOrdersLevels()}
                swingHighsLowsMap={this.getSwingHighsLowsMap()}
                showGrid={showGrid}
                stops={this.getStops()}
                zones={premise ? premise.analysis.srZones : null}
                candlePatternsUp={this.getCandlePatternsUp()}
                candlePatternsDown={this.getCandlePatternsDown()}/>
        )
    }
}