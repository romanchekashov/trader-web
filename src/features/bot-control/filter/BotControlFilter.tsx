import * as React from "react";
import {useEffect, useState} from "react";
import {Button} from "primereact/button";
import {Dropdown} from "primereact/dropdown";
import {MarketBotFilterDataDto} from "../../../common/data/bot/MarketBotFilterDataDto";
import {Broker} from "../../../common/data/Broker";
import {TradingPlatform} from "../../../common/data/TradingPlatform";
import {SecurityInfo} from "../../../common/data/SecurityInfo";
import {Interval} from "../../../common/data/Interval";
import "./BotControlFilter.css";
import {MarketBotStartDto} from "../../../common/data/bot/MarketBotStartDto";
import {BotControlFilterHistory} from "./BotControlFilterHistory";
import {Intervals, PrimeDropdownItem} from "../../../common/utils/utils";
import {ClassCode} from "../../../common/data/ClassCode";
import {Security} from "../../../common/data/Security";
import {getSecuritiesByClassCode} from "../../../common/utils/Cache";
import {MarketSecuritiesDto} from "../../../common/data/bot/MarketSecuritiesDto";
import {HistoryDateDto} from "../../../common/data/bot/HistoryDateDto";
import {HistorySetup} from "../../../common/data/HistorySetup";
import {TradingStrategy} from "../../../common/data/TradingStrategy";
import {DepositSetupView} from "./DepositSetupView";
import {DepositSetup} from "../../../common/data/DepositSetup";
import moment = require("moment");

export interface BotControlFilterState {
    broker: Broker
    platform: TradingPlatform
    market: MarketSecuritiesDto
    security: PrimeDropdownItem<SecurityInfo>
    demo: boolean
    highTimeFrame: Interval
    tradingTimeFrame: Interval
    lowTimeFrame: Interval
    history: boolean
    start: Date
    end: Date
    debug: boolean
}

type Props = {
    filter: MarketBotFilterDataDto
    onStart: (data: MarketBotStartDto) => void
    onStopHistory: (data: MarketBotStartDto) => void
};

export const BotControlFilter: React.FC<Props> = ({filter, onStart, onStopHistory}) => {
    let initState: BotControlFilterState = {
        broker: filter ? filter.broker : null,
        platform: filter ? filter.broker.tradingPlatform : null,
        market: filter ? filter.marketSecurities[0] : null,
        security: null,
        demo: true,
        highTimeFrame: Interval.M30,
        tradingTimeFrame: Interval.M3,
        lowTimeFrame: Interval.M1,
        history: false,
        start: null,
        end: null,
        debug: false
    };

    const brokers = filter ? [filter.broker] : [];
    const [broker, setBroker] = useState(initState.broker);

    const platforms = filter ? [filter.broker.tradingPlatform].map(val => ({label: val, value: val})) : [];
    const [platform, setPlatform] = useState(initState.platform);

    const [depositSetup, setDepositSetup] = useState<DepositSetup>({
        demo: true,
        amount: 100000,
        maxRiskPerTradeInPercent: 1,
        maxRiskPerSessionTimeoutInPercent: 2,
        maxRiskPerSessionInPercent: 3,
        takeProfitPerTradeFactorFirst: 2,
        takeProfitPerTradeFactorSecond: 4
    });
    const [interval, setInterval] = useState(null);
    const [minInterval, setMinInterval] = useState(Interval.M1);
    const [classCode, setClassCode] = useState(null);
    const [secCode, setSecCode] = useState(null);
    const [secCodes, setSecCodes] = useState([{label: "ALL", value: null}]);
    const [strategy, setStrategy] = useState(null);
    const [minStartDate, setMinStartDate] = useState(null);
    const [maxEndDate, setMaxEndDate] = useState(null);

    const intervals: PrimeDropdownItem<Interval>[] = [null, ...Intervals].map(val => ({
        label: val || "ALL",
        value: val
    }));
    const minIntervals: PrimeDropdownItem<Interval>[] = [Interval.M1, Interval.M3, Interval.M5]
        .map(val => ({label: val || "ALL", value: val}));
    const classCodes: PrimeDropdownItem<ClassCode>[] = [null, ClassCode.SPBFUT, ClassCode.TQBR, ClassCode.CETS]
        .map(val => ({label: val || "ALL", value: val}));
    const strategies: PrimeDropdownItem<string>[] = [null, "TREND_LINE_BREAKOUT", "TREND_CHANGE"]
        .map(val => ({label: val || "ALL", value: val}));

    useEffect(() => {
        if (brokers.length === 1) {
            // console.log(['arguments'], initState.broker, broker);
            setBroker(initState.broker);
            setPlatform(initState.platform);
        }
    });

    const getDto = (): MarketBotStartDto => {
        let historySetup: HistorySetup = null;

        if (history) {
            historySetup = {
                start,
                end
            };
        }

        return {
            brokerId: broker.id,
            tradingPlatform: platform,
            classCode: classCode,
            secCode: secCode,

            timeFrameTrading: interval,
            timeFrameMin: minInterval,

            depositSetup,
            historySetup,
            strategy: TradingStrategy.futuresSimpleTradingStrategy
        };
    };

    const onStartClicked = () => {
        console.log(getDto());
        onStart(getDto());
    };

    const [history, setHistory] = useState(initState.history);
    const [start, setStart] = useState(initState.start);
    const [end, setEnd] = useState(initState.end);
    const [debug, setDebug] = useState(initState.debug);

    const onHistory = (history: boolean) => {
        setHistory(history);
        depositSetup.demo = true;
        setDepositSetup(Object.assign({}, depositSetup));
    };

    const onStopHistoryClicked = () => {
        onStopHistory(getDto());
    };

    const onIntervalChanged = (newInterval: Interval) => {
        console.log(newInterval);
        setInterval(newInterval);
    };

    const onMinIntervalChanged = (newInterval: Interval) => {
        console.log(newInterval);
        setMinInterval(newInterval);
        updateHistoryDates(secCode, newInterval);
    };

    const onClassCodeChanged = (newClassCode: ClassCode) => {
        console.log(newClassCode);
        const newSecCodes: PrimeDropdownItem<string>[] = [{label: "ALL", value: null}];
        if (newClassCode) {
            const securities: Security[] = getSecuritiesByClassCode(newClassCode);
            for (const sec of securities) {
                newSecCodes.push({label: sec.secCode, value: sec.secCode});
            }
        } else {
            setSecCode(null);
        }
        setClassCode(newClassCode);
        setSecCodes(newSecCodes);
        setSecCode(null);
    };

    const onSecCodeChanged = (newSecCode: string) => {
        console.log(newSecCode);
        setSecCode(newSecCode);
        updateHistoryDates(newSecCode, minInterval);
    };

    const onStrategyChanged = (newStrategy: string) => {
        console.log(newStrategy);
        setStrategy(newStrategy);
    };

    const updateHistoryDates = (newSecCode: string, minInterval: Interval) => {
        const market: MarketSecuritiesDto = filter.marketSecurities.find(value => value.classCode === classCode);
        const id: number = market.securities.find(value => value.futureSecCode === newSecCode || value.code === newSecCode).id;
        const dto: HistoryDateDto = market.securityHistoryDate[id].find(value => value.interval === minInterval);
        const min = moment(dto.start).toDate();
        const max = moment(dto.end).toDate();
        setMinStartDate(min);
        setMaxEndDate(max);
        setStart(min);
        setEnd(max);
    };

    const onDepositSetupChanged = (newSetup: DepositSetup): void => {
        setDepositSetup(Object.assign({}, newSetup));
    };

    return (
        <div className="p-grid filter">
            <div className="p-col-8">
                <div className="p-grid">
                    <div className="p-col-2">
                        <div style={{fontSize: "10px"}}>Broker</div>
                        <Dropdown optionLabel="name"
                                  value={broker}
                                  options={brokers}
                                  onChange={(e) => {
                                      setBroker(e.value)
                                  }}
                                  placeholder="Select a broker"
                                  style={{width: '130px'}}/>
                    </div>
                    <div className="p-col-2">
                        <div style={{fontSize: "10px"}}>Trading platform</div>
                        <Dropdown value={platform}
                                  options={platforms}
                                  onChange={(e) => {
                                      setPlatform(e.value)
                                  }}
                                  placeholder="Select a platform"
                                  style={{width: '80px'}}/>
                    </div>
                    <div className="p-col-2">
                        <div style={{fontSize: "10px"}}>Class code</div>
                        <Dropdown value={classCode}
                                  options={classCodes}
                                  onChange={(e) => {
                                      onClassCodeChanged(e.value);
                                  }}
                                  style={{width: '90px'}}/>
                    </div>
                    <div className="p-col-2">
                        <div style={{fontSize: "10px"}}>Sec code</div>
                        <Dropdown value={secCode}
                                  options={secCodes}
                                  onChange={(e) => {
                                      onSecCodeChanged(e.value);
                                  }}
                                  filter={true}
                                  style={{width: '90px'}}/>
                    </div>
                    <div className="p-col-1">
                        <div style={{fontSize: "10px"}}>Trading Interval</div>
                        <Dropdown value={interval}
                                  options={intervals}
                                  onChange={(e) => {
                                      onIntervalChanged(e.value);
                                  }} style={{width: '80px'}}/>
                    </div>
                    <div className="p-col-1">
                        <div style={{fontSize: "10px"}}>Min Interval</div>
                        <Dropdown value={minInterval}
                                  options={minIntervals}
                                  onChange={(e) => {
                                      onMinIntervalChanged(e.value);
                                  }} style={{width: '80px'}}/>
                    </div>
                    <div className="p-col-2">
                        <Dropdown value={strategy} options={strategies}
                                  onChange={(e) => {
                                      onStrategyChanged(e.value);
                                  }} filter={true}/>
                    </div>
                </div>
                <DepositSetupView setup={depositSetup}
                                  onChange={onDepositSetupChanged}/>
            </div>
            <div className="p-col-4">
                <div className="p-grid">
                    <div className="p-col-12">
                        <BotControlFilterHistory start={start}
                                                 end={end}
                                                 minStartDate={minStartDate}
                                                 maxEndDate={maxEndDate}
                                                 onEnabled={onHistory}
                                                 onStartDate={setStart}
                                                 onEndDate={setEnd}
                                                 onDebug={setDebug} onStop={onStopHistoryClicked}/>
                    </div>
                    <div className="p-col-12">
                        <Button label="Start" icon="pi pi-caret-right"
                                className="p-button-warning"
                                onClick={onStartClicked}/>
                    </div>
                </div>
            </div>
        </div>
    )
};
