import * as React from "react";
import {memo, useEffect, useState} from "react";
import "./MarketState.css";
import {playSound} from "../../assets/assets";
import {getMarketState} from "../../api/rest/analysisRestApi";
import {WebsocketService, WSEvent} from "../../api/WebsocketService";
import {FixedSizeList as List} from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import {Intervals, PrimeDropdownItem} from "../../utils/utils";
import {Interval} from "../../data/Interval";
import {ClassCode} from "../../data/ClassCode";
import {MarketStateFilterDto} from "./data/MarketStateFilterDto";
import {MarketStateDto} from "./data/MarketStateDto";
import {PatternResult} from "../alerts/data/PatternResult";
import {MarketStateInterval} from "./data/MarketStateInterval";
import {PatternName} from "../alerts/data/PatternName";
import {Signal} from "../../data/Signal";
import moment = require("moment");
import {Button} from "primereact/button";

type Props = {
    filter: MarketStateFilterDto
    viewHeight?: number
};
let fetchAlertsAttempt = 0;
let previousAlertsCount = 0;

const MarketState: React.FC<Props> = ({filter, viewHeight}) => {

    const [marketStateIntervals, setMarketStateIntervals] = useState<MarketStateInterval[]>([]);
    const [limit, setLimit] = useState(1);
    const [fetchDataStatus, setFetchDataStatus] = useState(null);
    const [selectedMarketStateItem, setSelectedMarketStateItem] = useState(null);

    const dateTimeFormat = {
        "M1": "HH:mm/DD MMM YY",
        "M3": "HH:mm/DD MMM YY",
        "M5": "HH:mm/DD MMM YY",
        "M15": "HH:mm/DD MMM YY",
        "M30": "HH:mm/DD MMM YY",
        "M60": "HH:mm/DD MMM YY",
        "H2": "HH:mm/DD MMM YY",
        "H4": "HH:mm/DD MMM YY",
        "DAY": "DD MMM YY",
        "WEEK": "DD MMM YY",
        "MONTH": "DD MMM YY"
    };
    const dateTimeFormatInner = {
        "M1": "HH:mm",
        "M3": "HH:mm",
        "M5": "HH:mm",
        "M15": "HH:mm",
        "M30": "HH:mm",
        "M60": "HH:mm",
        "H2": "HH:mm",
        "H4": "HH:mm",
        "DAY": "DD MMM",
        "WEEK": "DD MMM",
        "MONTH": "DD MMM"
    };

    const candleSentimentMap = {
        BULLISH: 'BULL',
        NEUTRAL: 'N',
        BEARISH: 'BEAR',
        BULLISH_STRONG: 'BULLS',
        BULLISH_WEAK: 'BULLW',
        BEARISH_STRONG: 'BEARS',
        BEARISH_WEAK: 'BEARW'
    };

    const intervals: PrimeDropdownItem<Interval>[] = [null, ...Intervals]
        .map(val => ({label: val || "ALL", value: val}));
    const classCodes: PrimeDropdownItem<ClassCode>[] = [null, ClassCode.SPBFUT, ClassCode.TQBR, ClassCode.CETS]
        .map(val => ({label: val || "ALL", value: val}));

    const fetchAlerts = () => {
        setFetchDataStatus("Loading market states for " + filter.secCode + "...");
        getMarketState(filter)
            .then(marketState => {
                setAlertsReceivedFromServer(marketState);
                setFetchDataStatus(null);
            })
            .catch(reason => {
                setMarketStateIntervals([]);
                setFetchDataStatus("Cannot get market states for " + filter.secCode);
                if (fetchAlertsAttempt < 3) {
                    fetchAlertsAttempt++;
                    fetchAlerts();
                }
            });
    };

    const notifyOnNewAlert = (newAlerts: PatternResult[]): void => {
        if (newAlerts && newAlerts.length !== previousAlertsCount) {
            playSound(4);
            previousAlertsCount = newAlerts.length;
        }
    };

    useEffect(() => {
        let alertsSubscription;
        if (filter) {
            fetchAlertsAttempt = 0;

            if (filter.fetchByWS) {
                alertsSubscription = WebsocketService.getInstance()
                    .on<MarketStateDto>(filter.history ? WSEvent.HISTORY_MARKET_STATES : WSEvent.MARKET_STATES)
                    .subscribe(marketState => {
                        for (const marketStateInterval of marketState.marketStateIntervals) {
                            for (const item of marketStateInterval.items) {
                                item.candle.timestamp = new Date(item.candle.timestamp);
                            }
                        }
                        setAlertsReceivedFromServer(marketState);
                    });
            }
            fetchAlerts();
        }

        // Specify how to clean up after this effect:
        return function cleanup() {
            if (alertsSubscription) alertsSubscription.unsubscribe();
        };
    }, [filter]);

    const setAlertsReceivedFromServer = (marketState: MarketStateDto): void => {
        const baseInterval: Interval = marketState.marketStateIntervals[0].interval;
        const interval: Interval = marketState.marketStateIntervals[1].interval;
        const limit = getLimit(interval, baseInterval);

        const baseItems: MarketStateInterval[] = [];
        let prevItemsLength = -1;

        for (const item of marketState.marketStateIntervals[0].items) {
            const marketStateInterval = new MarketStateInterval();
            marketStateInterval.baseInterval = baseInterval;
            marketStateInterval.baseItem = item;
            marketStateInterval.interval = interval;

            const items = marketState.marketStateIntervals[1].items
                .filter(value => value.candle.timestamp.getTime() >= item.candle.timestamp.getTime());
            if (prevItemsLength !== items.length) {
                marketStateInterval.items = items.slice(items.length > limit ? items.length - limit : 0, items.length);
                prevItemsLength = items.length;
            } else {
                marketStateInterval.items = [];
            }

            baseItems.push(marketStateInterval);
        }

        setLimit(limit);
        setMarketStateIntervals(baseItems);
        // notifyOnNewAlert(newAlerts);
    };

    const getLimit = (minInterval: Interval, maxInterval: Interval): number => {
        switch (maxInterval) {
            case Interval.M3:
                return 3;
            case Interval.M5:
                return 5;
            case Interval.M15:
                switch (minInterval) {
                    case Interval.M5:
                        return 3;
                    case Interval.M3:
                        return 5;
                    default:
                        return 1;
                }
            case Interval.M30:
                switch (minInterval) {
                    case Interval.M5:
                        return 6;
                    case Interval.M3:
                        return 10;
                    default:
                        return 1;
                }
            case Interval.M60:
                switch (minInterval) {
                    case Interval.M15:
                        return 4;
                    case Interval.M5:
                        return 12;
                    default:
                        return 1;
                }
            case Interval.H2:
                switch (minInterval) {
                    case Interval.M30:
                        return 4;
                    case Interval.M15:
                        return 8;
                    default:
                        return 1;
                }
            case Interval.H4:
                switch (minInterval) {
                    case Interval.H2:
                        return 2;
                    case Interval.M60:
                        return 4;
                    case Interval.M30:
                        return 8;
                    default:
                        return 1;
                }
            case Interval.DAY:
                switch (minInterval) {
                    case Interval.H4:
                        return 2;
                    case Interval.H2:
                        return 4;
                    case Interval.M60:
                        return 8;
                    default:
                        return 1;
                }
            case Interval.WEEK:
                switch (minInterval) {
                    case Interval.DAY:
                        return 5;
                    case Interval.H4:
                        return 10;
                    case Interval.H2:
                        return 20;
                    default:
                        return 1;
                }
            case Interval.MONTH:
                switch (minInterval) {
                    case Interval.WEEK:
                        return 4;
                    default:
                        return 1;
                }
            default:
                return 1;
        }
    };

    const getCandlePatternClassName = (alert: Signal) => {
        let className = "";
        const name = alert.name.split("-")[1];
        const sInterval = alert.interval.toString();

        if (PatternName.BEARISH_REVERSAL_PATTERN_DARK_CLOUD_COVER === name) {
            className += "bearish-reversal-pattern-dark-cloud-cover-" + sInterval.toLowerCase();
        } else if (PatternName.BEARISH_REVERSAL_PATTERN_ENGULFING === name) {
            className += "bearish-reversal-pattern-engulfing-" + sInterval.toLowerCase();
        } else if (PatternName.BEARISH_REVERSAL_PATTERN_EVENING_STAR === name) {
            className += "bearish-reversal-pattern-evening-star-" + sInterval.toLowerCase();
        } else if (PatternName.BEARISH_REVERSAL_PATTERN_HANGING_MAN === name) {
            className += "bearish-reversal-pattern-hanging-man-" + sInterval.toLowerCase();
        } else if (PatternName.BEARISH_REVERSAL_PATTERN_HARAMI === name) {
            className += "bearish-reversal-pattern-harami-" + sInterval.toLowerCase();
        } else if (PatternName.BEARISH_REVERSAL_PATTERN_SHOOTING_STAR === name) {
            className += "bearish-reversal-pattern-shooting-star-" + sInterval.toLowerCase();
        } else if (PatternName.BULLISH_REVERSAL_PATTERN_ENGULFING === name) {
            className += "bullish-reversal-pattern-engulfing-" + sInterval.toLowerCase();
        } else if (PatternName.BULLISH_REVERSAL_PATTERN_HAMMER === name) {
            className += "bullish-reversal-pattern-hammer-" + sInterval.toLowerCase();
        } else if (PatternName.BULLISH_REVERSAL_PATTERN_HARAMI === name) {
            className += "bullish-reversal-pattern-harami-" + sInterval.toLowerCase();
        } else if (PatternName.BULLISH_REVERSAL_PATTERN_INVERTED_HAMMER === name) {
            className += "bullish-reversal-pattern-inverted-hammer-" + sInterval.toLowerCase();
        } else if (PatternName.BULLISH_REVERSAL_PATTERN_MORNING_STAR === name) {
            className += "bullish-reversal-pattern-morning-star-" + sInterval.toLowerCase();
        } else if (PatternName.BULLISH_REVERSAL_PATTERN_PIERCING === name) {
            className += "bullish-reversal-pattern-piercing-" + sInterval.toLowerCase();
        } else if (PatternName.REVERSAL_PATTERN_DOJI === name) {
            className += "reversal-pattern-doji-" + sInterval.toLowerCase();
        }
        return className;
    };

    const nameTemplate = (signal: Signal) => {
        let className = "alert-icon ";
        const sInterval = signal.interval.toString();
        const title = `${signal.name} - Interval: ${sInterval}`;
        const sArr = signal.name.split("-");

        if (sArr.length > 1) {
            if ("CANDLE_PATTERN" === sArr[0]) {
                className += getCandlePatternClassName(signal);
            } else if ("PRICE_CLOSE_TO_SR_LEVEL" === sArr[0]) {
                const cls = signal.name.replace("PRICE_CLOSE_TO_SR_LEVEL", "sr_level_cross");
                className += cls.toLowerCase() + "-" + sInterval.toLowerCase();
            } else if ("PRICE_CLOSE_TO_TREND_LINE" === sArr[0]) {
                const cls = signal.name.replace("PRICE_CLOSE_TO_TREND_LINE", "trend_line_cross");
                className += cls.toLowerCase() + "-" + sInterval.toLowerCase();
            } else if ("SR_ZONE_CROSS" === sArr[0]) {
                className += signal.name.toLowerCase();
            } else {
                className += signal.name.toLowerCase() + "-" + sInterval.toLowerCase();
            }
        }

        return <div key={signal.description}
                    className={className}
                    title={title}></div>;
    };

    if (!filter) {
        return (<>Filter for market state is not set.</>);
    }

    if (filter && fetchDataStatus) {
        return (
            <div>
                {fetchDataStatus}
                <Button icon="pi pi-refresh" style={{marginLeft:'.25em'}} onClick={fetchAlerts} />
            </div>
        );
    }

    const Row = ({index, style}) => {
        const item: MarketStateInterval = marketStateIntervals[index];
        const className = "market-state-column" + (selectedMarketStateItem === item ? " selected" : "");
        const classNameInner = "market-state-column-inner" + (selectedMarketStateItem === item ? " selected" : "");
        const innerWidthPercent = item.baseInterval === Interval.M3 ? 100 / limit : 100;

        return (
            <div className={index % 2 ? "ListItemOdd" : "ListItemEven"} style={style}>
                <div className={className}
                     onClick={() => {
                         setSelectedMarketStateItem(item);
                     }}>

                    <div
                        className={"market-state-column-main " + item.baseItem.candleSentiment.toString().toLowerCase()}>
                        <div className="market-state-column-time">
                            {item.baseInterval} | {moment(item.baseItem.candle.timestamp).format(dateTimeFormat[item.baseInterval])}
                        </div>
                        <div className="market-state-column-candle-sentiment">
                            {candleSentimentMap[item.baseItem.candleSentiment]} / {item.baseItem.candle.close}
                        </div>
                        <div className="market-state-column-ema-cross">
                            {item.baseItem.emaCrossOperation} / {item.baseItem.emaCrossPrice}
                        </div>
                        <div>
                            {item.baseItem.signals
                                .filter(signal => signal.name.indexOf("CANDLE_PATTERN") !== -1)
                                .map(signal => nameTemplate(signal))}
                        </div>
                        <div className={"market-state-column-signals grid-" + (3 * limit)}>
                            {item.baseItem.signals
                                .filter(signal => signal.name.indexOf("CANDLE_PATTERN") === -1)
                                .map(signal => (
                                <div key={signal.name + signal.price + signal.interval + signal.timestamp}
                                     className="market-state-column-signal">
                                    {nameTemplate(signal)}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={classNameInner}>
                        {
                            item.items.map((value, index1) => {
                                return (
                                    <div key={index1}
                                         className={"market-state-column-inner-column " + value.candleSentiment.toString().toLowerCase()}
                                         style={{width: innerWidthPercent + "%"}}
                                         onClick={() => {
                                             setSelectedMarketStateItem(value);
                                         }}>
                                        <div className="market-state-column-time">
                                            {moment(value.candle.timestamp).format(dateTimeFormatInner[item.interval])}
                                        </div>
                                        <div className="market-state-column-candle-sentiment">
                                            {candleSentimentMap[value.candleSentiment]} / {value.candle.close}
                                        </div>
                                        <div className="market-state-column-ema-cross">
                                            {value.emaCrossOperation} / {value.emaCrossPrice}
                                        </div>
                                        <div>
                                            {value.signals
                                                .filter(signal => signal.name.indexOf("CANDLE_PATTERN") !== -1)
                                                .map(signal => nameTemplate(signal))}
                                        </div>
                                        <div className={"market-state-column-inner-signals grid-2"}>
                                            {value.signals
                                                .filter(signal => signal.name.indexOf("CANDLE_PATTERN") === -1)
                                                .map(signal => (
                                                <div key={signal.name + signal.price + signal.interval + signal.timestamp}
                                                     className="market-state-column-signal">
                                                    {nameTemplate(signal)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-grid market-state" style={{height: viewHeight || 300}}>
            <div className="p-col-12 market-state-body" style={{height: (viewHeight || 300) - 0}}>
                <AutoSizer>
                    {({height, width}) => (
                        <List
                            className="List"
                            direction="rtl"
                            layout="horizontal"
                            height={height}
                            itemCount={marketStateIntervals.length}
                            itemSize={40 * limit}
                            width={width}
                        >
                            {Row}
                        </List>
                    )}
                </AutoSizer>
            </div>
        </div>
    )
};

export default memo(MarketState);