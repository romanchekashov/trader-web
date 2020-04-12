import * as React from "react";
import CandleStickChartForDiscontinuousIntraDay from "./CandleStickChartForDiscontinuousIntraDay";
import {ChartDrawType} from "./data/ChartDrawType";
import {ChartElementAppearance} from "./data/ChartElementAppearance";
import {ChartLevel} from "./data/ChartLevel";
import {getHistoryCandles} from "../../api/historyTraderApi";
import {Interval} from "../../api/dto/Interval";
import {Candle} from "../../api/dto/Candle";
import {getCandles} from "../../api/baseApi";
import {SecurityLastInfo} from "../../api/dto/SecurityLastInfo";
import {TradePremise} from "../../api/dto/strategy/TradePremise";
import {Order} from "../../api/dto/Order";
import {OperationType} from "../../api/dto/OperationType";
import moment = require("moment");
import {Trend} from "../../api/dto/strategy/Trend";
import {TradeSetup} from "../../api/dto/strategy/TradeSetup";

type Props = {
    interval: Interval
    width: number
    numberOfCandles: number
    security: SecurityLastInfo
    classCode?: string
    securityCode?: string
    premise?: TradePremise
    tradeSetups?: TradeSetup[]
    orders?: Order[]
    history?: boolean
    trend?: Trend
    showGrid?: boolean
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
        this.state = { candles: [], nodata: false, fetchCandlesInterval: 1, fetchCandlesCountdown: 0,
            fetchCandlesAttempts: 0, secCode: null };
    }

    getNewCandles = (): Promise<Candle[]> => {
        const { interval, numberOfCandles, history, classCode, securityCode } = this.props;
        if (history) {
            return getHistoryCandles(classCode, securityCode, interval, numberOfCandles);
        } else {
            return getCandles(classCode, securityCode, interval, numberOfCandles);
        }
    };

    fetchCandlesInner = (fetchCandlesInterval, fetchCandlesAttempts) => {
        this.getNewCandles()
            .then(data => {
                if (data && data.length > 0 && data[0].open === 0) {
                    this.setState({
                        candles: [],
                        nodata: true,
                        fetchCandlesCountdown: fetchCandlesInterval,
                        fetchCandlesAttempts: 0 })
                } else {
                    this.setState({
                        candles: data.map(c => {
                            c.timestamp = moment(c.timestamp).toDate();
                            return c;
                        }),
                        nodata: false,
                        fetchCandlesCountdown: fetchCandlesInterval, fetchCandlesAttempts: 0 })
                }
            })
            .catch(reason => {
                if (fetchCandlesAttempts === ChartWrapper.FETCH_CANDLES_ATTEMPTS) {
                    this.setState({ fetchCandlesCountdown: fetchCandlesInterval, fetchCandlesAttempts: 0 });
                } else {
                    this.setState({fetchCandlesAttempts: fetchCandlesAttempts + 1});
                }
            });
    };

    fetchCandles = () => {
        const { security } = this.props;
        const { fetchCandlesInterval, fetchCandlesCountdown, candles, fetchCandlesAttempts, secCode } = this.state;

        if (security) {
            if (secCode !== security.secCode) {
                this.setState({ fetchCandlesCountdown: 0, fetchCandlesAttempts: 0, candles: [], nodata: false,
                    secCode: security.secCode });
                return;
            }

            if (fetchCandlesCountdown === 0) {
                this.fetchCandlesInner(fetchCandlesInterval, fetchCandlesAttempts);
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
                    this.setState({ candles: [...candles], nodata: false });
                }
            }
        } else {
            if (fetchCandlesCountdown === 0) {
                this.fetchCandlesInner(fetchCandlesInterval, fetchCandlesAttempts);
            } else {
                this.setState({fetchCandlesCountdown: fetchCandlesCountdown - 1});
            }
        }
    };

    componentDidMount = () => {
        if (this.props.interval === Interval.M1) this.setState({fetchCandlesInterval: 10, fetchCandlesCountdown: 0});
        if (this.props.interval === Interval.M5) this.setState({fetchCandlesInterval: 10, fetchCandlesCountdown: 0});

        this.setIntervalIdForFetchCandles = setInterval(() => {this.fetchCandles()}, 1000);
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

    render() {
        const { candles, nodata } = this.state;

        if (candles.length === 0 && !nodata) {
            return <div>Loading...</div>
        }

        if (nodata) {
            return <div>No data</div>
        }

        const { width, premise, orders, trend, showGrid } = this.props;

        let htSRLevels: ChartLevel[] = [];
        if (premise && premise.analysis.htSRLevels) {
            const resistanceLevels = premise.analysis.htSRLevels.resistanceLevels;
            const supportLevels = premise.analysis.htSRLevels.supportLevels;
            htSRLevels = [...ChartWrapper.mapChartSRLevels(resistanceLevels, {stroke: "red"}),
                ...ChartWrapper.mapChartSRLevels(supportLevels, {stroke: "green"})];
        }
        let ordersLevels: ChartLevel[] = [];
        if (orders) {
            ordersLevels = [
                ...ChartWrapper.mapChartSRLevels(orders
                    .filter(value => OperationType.SELL === value.operation)
                    .map(value => value.price), {stroke: "red"}),
                ...ChartWrapper.mapChartSRLevels(orders
                    .filter(value => OperationType.SELL !== value.operation)
                    .map(value => value.price), {stroke: "green"})
            ];
        }

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

        let tradeSetupMap = {};
        tradeSetupMap[candles[50].timestamp.getTime()] = {
            operation: OperationType.BUY
        };
        tradeSetupMap[candles[150].timestamp.getTime()] = {
            operation: OperationType.SELL
        };

        return (
            <CandleStickChartForDiscontinuousIntraDay
                type={ChartDrawType.CANVAS_SVG}
                data={candles}
                width={width}
                ratio={1}
                htSRLevels={htSRLevels}
                orders={ordersLevels}
                swingHighsLowsMap={swingHighsLowsMap}
                showGrid={showGrid}
                tradeSetupMap={tradeSetupMap} />
        )
    }
}