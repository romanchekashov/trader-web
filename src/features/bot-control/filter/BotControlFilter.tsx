import * as React from "react";
import {useEffect, useState} from "react";
import {Button} from "primereact/button";
import {Dropdown} from "primereact/dropdown";
import {MarketBotFilterDataDto, MarketSecuritiesDto} from "../../../common/data/bot/MarketBotFilterDataDto";
import {Broker} from "../../../common/data/Broker";
import {TradingPlatform} from "../../../common/data/TradingPlatform";
import {SecurityInfo} from "../../../common/data/SecurityInfo";
import {Interval} from "../../../common/data/Interval";
import "./BotControlFilter.css";
import {MarketBotStartDto} from "../../../common/data/bot/MarketBotStartDto";
import {ToggleButton} from "primereact/togglebutton";
import {BotControlFilterHistory} from "./BotControlFilterHistory";
import {PrimeDropdownItem} from "../../../common/utils/utils";
import {ClassCode} from "../../../common/data/ClassCode";
import {Security} from "../../../common/data/Security";
import {getSecuritiesByClassCode} from "../../../common/utils/Cache";
import {InputText} from "primereact/inputtext";

export interface BotControlFilterState {
    broker: Broker
    platform: TradingPlatform
    market: MarketSecuritiesDto
    security: PrimeDropdownItem<SecurityInfo>
    realDepo: boolean
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
        realDepo: false,
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

    const [interval, setInterval] = useState(null);
    const [classCode, setClassCode] = useState(null);
    const [secCode, setSecCode] = useState(null);
    const [secCodes, setSecCodes] = useState([{label: "ALL", value: null}]);
    const [stop, setStop] = useState(500);
    const [strategy, setStrategy] = useState(null);

    const intervals: PrimeDropdownItem<Interval>[] = [null, Interval.M1, Interval.M2, Interval.M3, Interval.M5,
        Interval.M10, Interval.M15, Interval.M30, Interval.M60, Interval.H2, Interval.H4, Interval.DAY,
        Interval.WEEK, Interval.MONTH]
        .map(val => ({label: val || "ALL", value: val}));
    const classCodes: PrimeDropdownItem<ClassCode>[] = [null, ClassCode.SPBFUT, ClassCode.TQBR, ClassCode.CETS]
        .map(val => ({label: val || "ALL", value: val}));
    const strategies: PrimeDropdownItem<string>[] = [null, "TREND_LINE_BREAKOUT", "TREND_CHANGE"]
        .map(val => ({label: val || "ALL", value: val}));

    const [realDepo, setRealDepo] = useState(initState.realDepo);

    useEffect(() => {
        if (brokers.length === 1) {
            // console.log(['arguments'], initState.broker, broker);
            setBroker(initState.broker);
            setPlatform(initState.platform);
        }
    });

    const onStartClicked = () => {
        onStart({
            brokerId: broker.id,
            tradingPlatform: platform,
            classCode: classCode,
            secCode: secCode,
            realDeposit: realDepo,
            timeFrameHigh: interval,
            timeFrameTrading: interval,
            timeFrameLow: interval,
            history: history,
            start: history ? start : null,
            end: history ? end : null
        });
    };

    const [history, setHistory] = useState(initState.history);
    const [start, setStart] = useState(initState.start);
    const [end, setEnd] = useState(initState.end);
    const [debug, setDebug] = useState(initState.debug);

    const onHistory = (history: boolean) => {
        setHistory(history);
        setRealDepo(false);
    };

    const onStopHistoryClicked = () => {
        onStopHistory({
            brokerId: broker.id,
            tradingPlatform: platform,
            classCode: classCode,
            secCode: secCode,
            realDeposit: realDepo,
            timeFrameHigh: interval,
            timeFrameTrading: interval,
            timeFrameLow: interval,
            history: history,
            start: history ? start : null,
            end: history ? end : null
        });
    };

    const onIntervalChanged = (newInterval: Interval) => {
        console.log(newInterval);
        setInterval(newInterval);
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
    };

    const onStrategyChanged = (newStrategy: string) => {
        console.log(newStrategy);
        setStrategy(newStrategy);
    };

    return (
        <div className="filter">
            <div className="p-toolbar-group-left">
                <Dropdown optionLabel="name" value={broker} options={brokers} onChange={(e) => {
                    setBroker(e.value)
                }} placeholder="Select a broker" style={{width: '130px'}}/>
                <Dropdown value={platform} options={platforms} onChange={(e) => {
                    setPlatform(e.value)
                }} placeholder="Select a platform" style={{width: '80px'}}/>

                <Dropdown value={classCode} options={classCodes}
                          onChange={(e) => {
                              onClassCodeChanged(e.value);
                          }} style={{width: '90px'}}/>
                <Dropdown value={secCode} options={secCodes}
                          onChange={(e) => {
                              onSecCodeChanged(e.value);
                          }} filter={true} style={{width: '90px'}}/>
                <Dropdown value={interval} options={intervals}
                          onChange={(e) => {
                              onIntervalChanged(e.value);
                          }} style={{width: '80px'}}/>
                <Dropdown value={strategy} options={strategies}
                          onChange={(e) => {
                              onStrategyChanged(e.value);
                          }} filter={true}/>

                <InputText type="number"
                           min={0}
                           value={stop}
                           onChange={(e) => setStop(e.target['value'])}
                           style={{width: '80px'}}/>
            </div>
            <div className="p-toolbar-group-right" style={{display: "flex"}}>
                <BotControlFilterHistory onEnabled={onHistory} onStartDate={setStart} onEndDate={setEnd}
                                         onDebug={setDebug} onStop={onStopHistoryClicked}/>
                {history ? null :
                    <ToggleButton checked={realDepo} onChange={(e) => setRealDepo(e.value)} onLabel="Real Depo"
                                  offLabel="Real Depo" style={{marginLeft: '10px'}}/>}
                <Button label="Start" icon="pi pi-caret-right" className="p-button-warning" onClick={onStartClicked}
                        style={{marginLeft: '10px'}}/>
            </div>
        </div>
    )
};
