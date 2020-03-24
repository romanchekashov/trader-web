import * as React from "react";
import CandleStickChartForDiscontinuousIntraDay from "./CandleStickChartForDiscontinuousIntraDay";
import {ChartDrawType} from "./data/ChartDrawType";
import {ChartElementAppearance} from "./data/ChartElementAppearance";
import {ChartLevel} from "./data/ChartLevel";
import {Interval} from "../../api/dto/Interval";
import {SecurityLastInfo} from "../../api/dto/SecurityLastInfo";
import {TradePremise} from "../../api/tradestrategyanalysis/dto/TradePremise";
import {Candle} from "../../api/dto/Candle";
import {getCandles} from "../../api/baseApi";

type Props = {
    interval: Interval,
    width: number,
    numberOfCandles: number,
    security: SecurityLastInfo
    premise?: TradePremise
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

    fetchCandles = () => {
        const { interval, numberOfCandles, security } = this.props;
        const { fetchCandlesInterval, fetchCandlesCountdown, candles, fetchCandlesAttempts, secCode } = this.state;

        if (security) {
            if (secCode !== security.secCode) {
                this.setState({ fetchCandlesCountdown: 0, fetchCandlesAttempts: 0, candles: [], nodata: false,
                    secCode: security.secCode });
                return;
            }

            if (fetchCandlesCountdown === 0) {
                getCandles(security.classCode, security.secCode, interval, numberOfCandles)
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
                                    c.timestamp = new Date(c.timestamp);
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
        }
    };

    componentDidMount = () => {
        if (this.props.interval === Interval.M1) this.setState({fetchCandlesInterval: 10, fetchCandlesCountdown: 0});
        if (this.props.interval === Interval.M5) this.setState({fetchCandlesInterval: 60, fetchCandlesCountdown: 0});

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

        const { width, premise } = this.props;

        let htSRLevels: ChartLevel[] = [];
        if (premise && premise.analysis.htSRLevels) {
            const resistanceLevels = premise.analysis.htSRLevels.resistanceLevels;
            const supportLevels = premise.analysis.htSRLevels.supportLevels;
            htSRLevels = [...ChartWrapper.mapChartSRLevels(resistanceLevels, {stroke: "red"}),
                ...ChartWrapper.mapChartSRLevels(supportLevels, {stroke: "green"})];
        }

        return (
            <CandleStickChartForDiscontinuousIntraDay
                type={ChartDrawType.CANVAS_SVG}
                data={candles}
                width={width}
                ratio={1}
                htSRLevels={htSRLevels} />
        )
    }
}