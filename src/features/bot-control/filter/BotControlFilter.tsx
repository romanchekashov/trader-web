import * as React from "react";
import {useEffect, useState} from "react";
import {Button} from "primereact/button";
import {Dropdown} from "primereact/dropdown";
import {MarketBotFilterDataDto} from "../../../common/data/bot/MarketBotFilterDataDto";
import {Broker} from "../../../common/data/Broker";
import {TradingPlatform} from "../../../common/data/trading/TradingPlatform";
import {SecurityInfo} from "../../../common/data/SecurityInfo";
import {Interval} from "../../../common/data/Interval";
import "./BotControlFilter.css";
import {MarketBotStartDto} from "../../../common/data/bot/MarketBotStartDto";
import {Intervals, PrimeDropdownItem} from "../../../common/utils/utils";
import {ClassCode} from "../../../common/data/ClassCode";
import {Security} from "../../../common/data/Security";
import {getSecuritiesByClassCode} from "../../../common/utils/Cache";
import {MarketSecuritiesDto} from "../../../common/data/bot/MarketSecuritiesDto";
import {HistoryDateDto} from "../../../common/data/bot/HistoryDateDto";
import {TradingStrategyName} from "../../../common/data/trading/TradingStrategyName";
import {DepositSetupView} from "./DepositSetupView";
import {DepositSetup} from "../../../common/data/DepositSetup";
import {TradeSystemType} from "../../../common/data/trading/TradeSystemType";
import {Calendar} from "primereact/calendar";
import {getCurrentDeposit} from "../../../common/api/rest/capitalRestApi";
import {getSecurityHistoryDates} from "../../../common/api/rest/botControlRestApi";
import {Panel} from "primereact/panel";
import moment = require("moment");

export interface BotControlFilterState {
    broker: Broker
    platform: TradingPlatform
    market: MarketSecuritiesDto
    security: PrimeDropdownItem<SecurityInfo>
    highTimeFrame: Interval
    tradingTimeFrame: Interval
    lowTimeFrame: Interval
    history: boolean
    start: Date
    end: Date
    debug: boolean
    systemType: TradeSystemType
    strategy: TradingStrategyName
}

type Props = {
    filter: MarketBotFilterDataDto
    onStart: (data: MarketBotStartDto) => void
    onSearch: (data: MarketBotStartDto) => void
    onStopHistory: (data: MarketBotStartDto) => void
};

export const BotControlFilter: React.FC<Props> = ({filter, onStart, onSearch, onStopHistory}) => {
    let initState: BotControlFilterState = {
        broker: filter ? filter.broker : null,
        platform: filter ? filter.broker.tradingPlatform : null,
        market: filter ? filter.marketSecurities[0] : null,
        security: null,
        highTimeFrame: Interval.M30,
        tradingTimeFrame: Interval.M3,
        lowTimeFrame: Interval.M1,
        history: false,
        start: null,
        end: null,
        debug: false,
        systemType: TradeSystemType.HISTORY,
        strategy: TradingStrategyName.TWO_EMA_CROSS
    };

    const brokers = filter ? [filter.broker] : [];
    const [broker, setBroker] = useState(initState.broker);

    const platforms = filter ? [filter.broker.tradingPlatform].map(val => ({label: val, value: val})) : [];
    const [platform, setPlatform] = useState(initState.platform);

    const [depositSetup, setDepositSetup] = useState<DepositSetup>({
        amount: 100000,
        maxRiskPerTradeInPercent: 1,
        maxRiskPerSessionInPercent: 3,
        takeProfitPerTradeFactorFirst: 3,
        takeProfitPerTradeFactorSecond: 6
    });
    const [interval, setInterval] = useState(null);
    const [minInterval, setMinInterval] = useState(Interval.M1);
    const [classCode, setClassCode] = useState(null);
    const [secCode, setSecCode] = useState(null);
    const [secId, setSecId] = useState<number>(null);
    const [secCodes, setSecCodes] = useState([{label: "ALL", value: null}]);
    const [minStartDate, setMinStartDate] = useState(null);
    const [maxEndDate, setMaxEndDate] = useState(null);
    const [realDeposit, setRealDeposit] = useState(null);
    const [panelCollapsed, setPanelCollapsed] = useState(true);

    const intervals: PrimeDropdownItem<Interval>[] = [null, ...Intervals].map(val => ({
        label: val || "ALL",
        value: val
    }));
    const minIntervals: PrimeDropdownItem<Interval>[] = [Interval.M1, Interval.M3, Interval.M5]
        .map(val => ({label: val || "ALL", value: val}));
    const classCodes: PrimeDropdownItem<ClassCode>[] = [null, ClassCode.SPBFUT, ClassCode.TQBR, ClassCode.CETS]
        .map(val => ({label: val || "ALL", value: val}));

    const systemTypes: PrimeDropdownItem<TradeSystemType>[] = [TradeSystemType.HISTORY,
        TradeSystemType.DEMO, TradeSystemType.REAL].map(val => ({label: val, value: val}));
    const [systemType, setSystemType] = useState(initState.systemType);

    const strategies: PrimeDropdownItem<TradingStrategyName>[] = [TradingStrategyName.TWO_EMA_CROSS]
        .map(val => ({label: val, value: val}));
    const [strategy, setStrategy] = useState(initState.strategy);

    useEffect(() => {
        if (brokers.length === 1) {
            // console.log(['arguments'], initState.broker, broker);
            setBroker(initState.broker);
            setPlatform(initState.platform);
        }

    }, [filter]);

    const getDto = (): MarketBotStartDto => {
        return {
            brokerId: broker.name,
            tradingPlatform: platform,
            secId,

            timeFrameTrading: interval,
            timeFrameMin: minInterval,

            depositSetup,
            systemType,
            start,
            end,
            strategy
        };
    };

    const onStartClicked = () => {
        console.log(getDto());
        onStart(getDto());
    };

    const onSearchClicked = () => {
        console.log(getDto());
        onSearch(getDto());
    };

    const [start, setStart] = useState(initState.start);
    const [end, setEnd] = useState(initState.end);

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
        getCurrentDeposit(newClassCode)
            .then(setRealDeposit);

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
        const secId = getSecuritiesByClassCode(classCode).find(value => value.secCode === newSecCode).id
        setSecId(secId)
        updateHistoryDates(newSecCode, minInterval);
    };

    const onStrategyChanged = (newStrategy: TradingStrategyName) => {
        console.log(newStrategy);
        setStrategy(newStrategy);
    };

    const updateHistoryDates = (newSecCode: string, minInterval: Interval) => {
        getSecurityHistoryDates(classCode, newSecCode)
            .then(value => {
                const dto: HistoryDateDto = value.historyDates.find(value => value.interval === minInterval);
                const min = moment(dto.start).toDate();
                const max = moment(dto.end).toDate();
                setMinStartDate(min);
                setMaxEndDate(max);
                setStart(min);
                setEnd(max);
            })
    };

    const onDepositSetupChanged = (newSetup: DepositSetup): void => {
        setDepositSetup(Object.assign({}, newSetup));
    };

    return (
        <Panel header="Filter" style={{marginTop: 0}}
               toggleable={true}
               collapsed={panelCollapsed}
               onToggle={(e) => setPanelCollapsed(e.value)}>
            <div className="p-grid filter">
                <div className="p-col-12">
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
                        <div className="p-col-1">
                            <div style={{fontSize: "10px"}}>Trading platform</div>
                            <Dropdown value={platform}
                                      options={platforms}
                                      onChange={(e) => {
                                          setPlatform(e.value)
                                      }}
                                      placeholder="Select a platform"
                                      style={{width: '80px'}}/>
                        </div>
                        <div className="p-col-1">
                            <div style={{fontSize: "10px"}}>Class code</div>
                            <Dropdown value={classCode}
                                      options={classCodes}
                                      onChange={(e) => {
                                          onClassCodeChanged(e.value);
                                      }}
                                      style={{width: '90px'}}/>
                        </div>
                        <div className="p-col-1">
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

                        <div className="p-col-1">
                            <div style={{fontSize: "10px"}}>Start</div>
                            <Calendar value={start}
                                      minDate={minStartDate}
                                      maxDate={maxEndDate}
                                      onChange={(e) => setStart(e.value as any)}
                                      showTime={true}
                                      inputStyle={{width: "90px"}}/>
                        </div>
                        <div className="p-col-1">
                            <div style={{fontSize: "10px"}}>End</div>
                            <Calendar value={end}
                                      minDate={minStartDate}
                                      maxDate={maxEndDate}
                                      onChange={(e) => setEnd(e.value as any)}
                                      showTime={true}
                                      inputStyle={{width: "90px"}}/>
                        </div>
                    </div>
                    <DepositSetupView realDeposit={realDeposit}
                                      setup={depositSetup}
                                      onChange={onDepositSetupChanged}/>
                </div>
                <div className="p-col-12">
                    <div className="p-grid">
                        <div className="p-col-2">
                            <div style={{fontSize: "10px"}}>Trading strategy</div>
                            <Dropdown value={strategy}
                                      options={strategies}
                                      onChange={(e) => {
                                          onStrategyChanged(e.value as any);
                                      }}/>
                        </div>
                        <div className="p-col-2">
                            <div style={{fontSize: "10px"}}>Trade system type</div>
                            <Dropdown value={systemType}
                                      options={systemTypes}
                                      onChange={(e) => {
                                          setSystemType(e.value as any);
                                      }}/>
                        </div>
                        <div className="p-col-1">
                            <Button label="Search" icon="pi pi-search"
                                    onClick={onSearchClicked}/>
                        </div>
                        <div className="p-col-1">
                            <Button label="Start" icon="pi pi-caret-right"
                                    className="p-button-success"
                                    onClick={onStartClicked}/>
                        </div>
                    </div>
                </div>
            </div>
        </Panel>
    )
};
