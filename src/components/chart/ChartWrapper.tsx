import * as React from "react";
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
import {getHistoryCandles} from "../../api/historyTraderApi";
import {Trend} from "../../data/strategy/Trend";
import {ActiveTrade} from "../../data/ActiveTrade";
import moment = require("moment");
import {getCandles} from "../../api/baseApi";

type Props = {
    interval: Interval,
    width: number,
    numberOfCandles: number,
    security: SecurityLastInfo
    premise?: TradePremise
    orders?: Order[]
    history?: boolean
    trend?: Trend
    showGrid?: boolean
    activeTrade?: ActiveTrade
};

type States = {
    candles: Candle[],
    nodata: boolean
    fetchCandlesAttempts: number
    fetchCandlesInterval: number
    fetchCandlesCountdown: number,
    secCode: string
};

export class ChartWrapper extends React.Component<Props, States> {

    private static FETCH_CANDLES_ATTEMPTS = 3;
    private setIntervalIdForFetchCandles: NodeJS.Timeout = null;

    constructor(props) {
        super(props);
        this.state = {
            candles: [], nodata: false, fetchCandlesInterval: 1, fetchCandlesCountdown: 0,
            fetchCandlesAttempts: 0, secCode: null
        };
    }

    getNewCandles = (): Promise<Candle[]> => {
        const {interval, numberOfCandles, security, history} = this.props;
        if (history) {
            return getHistoryCandles(security.classCode, security.secCode, interval, numberOfCandles);
        } else {
            return getCandles(security.classCode, security.secCode, interval, numberOfCandles);
        }
    };

    fetchCandles = () => {
        const {security} = this.props;
        const {fetchCandlesInterval, fetchCandlesCountdown, candles, fetchCandlesAttempts, secCode} = this.state;

        if (security) {
            if (secCode !== security.secCode) {
                this.setState({
                    fetchCandlesCountdown: 0, fetchCandlesAttempts: 0, candles: [], nodata: false,
                    secCode: security.secCode
                });
                return;
            }

            if (fetchCandlesCountdown === 0) {
                this.getNewCandles()
                    .then(data => {
                        if (data && data.length > 0 && data[0].open === 0) {
                            this.setState({
                                candles: [],
                                nodata: true,
                                fetchCandlesCountdown: fetchCandlesInterval,
                                fetchCandlesAttempts: 0
                            })
                        } else {
                            this.setState({
                                candles: data.map(c => {
                                    c.timestamp = new Date(c.timestamp);
                                    return c;
                                }),
                                nodata: false,
                                fetchCandlesCountdown: fetchCandlesInterval, fetchCandlesAttempts: 0
                            })
                        }
                    })
                    .catch(reason => {
                        if (fetchCandlesAttempts === ChartWrapper.FETCH_CANDLES_ATTEMPTS) {
                            this.setState({fetchCandlesCountdown: fetchCandlesInterval, fetchCandlesAttempts: 0});
                        } else {
                            this.setState({fetchCandlesAttempts: fetchCandlesAttempts + 1});
                        }
                    });
            } else {
                this.setState({fetchCandlesCountdown: fetchCandlesCountdown - 1});
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
            }
        }
    };

    componentDidMount = () => {
        const {history} = this.props;

        if (this.props.interval === Interval.M1) {
            this.setState({
                fetchCandlesInterval: history ? 1 : 10,
                fetchCandlesCountdown: 0
            });
        }
        if (this.props.interval === Interval.M5) {
            this.setState({
                fetchCandlesInterval: history ? 1 : 10,
                fetchCandlesCountdown: 0
            });
        }

        this.setIntervalIdForFetchCandles = setInterval(() => {
            this.fetchCandles()
        }, 1000);
    };

    componentWillUnmount = (): void => {
        clearInterval(this.setIntervalIdForFetchCandles);
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
        const {premise} = this.props;

        if (premise && premise.analysis.htSRLevels) {
            const resistanceLevels = premise.analysis.htSRLevels.resistanceLevels;
            const supportLevels = premise.analysis.htSRLevels.supportLevels;
            return [
                ...ChartWrapper.mapChartSRLevels(resistanceLevels, {stroke: "red"}),
                ...ChartWrapper.mapChartSRLevels(supportLevels, {stroke: "green"})
            ];
        }
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
        if (premise && premise.analysis.trend) {
            swingHighsLowsMap = {};
            premise.analysis.trend.swingHighsLows
                .forEach(value => swingHighsLowsMap[moment(value.dateTime).toDate().getTime()] = value.swingHL);
        }

        if (trend) {
            swingHighsLowsMap = {};
            trend.swingHighsLows
                .forEach(value => swingHighsLowsMap[moment(value.dateTime).toDate().getTime()] = value.swingHL);
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
                zones={premise ? premise.analysis.srZones : []}/>
        )
    }
}