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
import {Security} from "../../../common/data/Security";
import {getSecuritiesByClassCode, getSecuritiesByTypeAndMarket} from "../../../common/utils/Cache";
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
import {BrokerId} from "../../../common/data/BrokerId";
import {SecurityType} from "../../../common/data/SecurityType";
import {Market} from "../../../common/data/Market";
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
}

export const BotControlFilter: React.FC<Props> = ({filter, onStart, onSearch, onStopHistory}) => {
    let initState: BotControlFilterState = {
        broker: filter ? filter.brokers[0] : null,
        platform: filter ? filter.brokers[0].tradingPlatform : null,
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
    }

    const brokers = filter ? filter.brokers : []
    const [broker, setBroker] = useState<Broker>(initState.broker)

    const [platforms, setPlatforms] = useState<PrimeDropdownItem<TradingPlatform>[]>([TradingPlatform.QUIK, TradingPlatform.API]
        .map(val => ({label: val, value: val})))
    const [platform, setPlatform] = useState<TradingPlatform>(initState.platform)

    const [markets, setMarkets] = useState<PrimeDropdownItem<Market>[]>([Market.MOEX, Market.SPB]
        .map(val => ({label: val, value: val})))
    const [market, setMarket] = useState<Market>(null)

    const [depositSetup, setDepositSetup] = useState<DepositSetup>({
        amount: 100000,
        maxRiskPerTradeInPercent: 1,
        maxRiskPerSessionInPercent: 3,
        takeProfitPerTradeFactorFirst: 3,
        takeProfitPerTradeFactorSecond: 6
    })
    const [interval, setInterval] = useState<Interval>(null)
    const [minInterval, setMinInterval] = useState<Interval>(Interval.M1)
    const [securityType, setSecurityType] = useState<SecurityType>(null)
    const [secCode, setSecCode] = useState(null)
    const [secId, setSecId] = useState<number>(null)
    const [secCodes, setSecCodes] = useState([{label: "ALL", value: null}])
    const [minStartDate, setMinStartDate] = useState(null)
    const [maxEndDate, setMaxEndDate] = useState(null)
    const [realDeposit, setRealDeposit] = useState(null)
    const [panelCollapsed, setPanelCollapsed] = useState(true)

    const intervals: PrimeDropdownItem<Interval>[] = [null, ...Intervals].map(val => ({
        label: val || "ALL",
        value: val
    }))
    const minIntervals: PrimeDropdownItem<Interval>[] = [Interval.M1, Interval.M3, Interval.M5]
        .map(val => ({label: val || "ALL", value: val}))
    const securityTypes: PrimeDropdownItem<SecurityType>[] = [null, SecurityType.FUTURE, SecurityType.STOCK, SecurityType.CURRENCY]
        .map(val => ({label: val || "ALL", value: val}))

    const systemTypes: PrimeDropdownItem<TradeSystemType>[] = [TradeSystemType.HISTORY,
        TradeSystemType.DEMO, TradeSystemType.REAL].map(val => ({label: val, value: val}))
    const [systemType, setSystemType] = useState(initState.systemType)

    const strategies: PrimeDropdownItem<TradingStrategyName>[] = [TradingStrategyName.TWO_EMA_CROSS]
        .map(val => ({label: val, value: val}))
    const [strategy, setStrategy] = useState(initState.strategy)

    useEffect(() => {
        if (brokers.length === 1) {
            // console.log(['arguments'], initState.broker, broker)
            setBroker(initState.broker)
            setPlatform(initState.platform)
        }

    }, [filter])

    const getDto = (): MarketBotStartDto => {
        return {
            brokerId: broker.id,
            tradingPlatform: platform,
            secId,

            timeFrameTrading: interval,
            timeFrameMin: minInterval,

            depositSetup,
            systemType,
            start,
            end,
            strategy
        }
    }

    const onStartClicked = () => {
        console.log(getDto())
        onStart(getDto())
    }

    const onSearchClicked = () => {
        console.log(getDto())
        onSearch(getDto())
    }

    const [start, setStart] = useState(initState.start)
    const [end, setEnd] = useState(initState.end)

    const onStopHistoryClicked = () => {
        onStopHistory(getDto())
    }

    const onIntervalChanged = (newInterval: Interval) => {
        console.log(newInterval)
        setInterval(newInterval)
    }

    const onMinIntervalChanged = (newInterval: Interval) => {
        console.log(newInterval)
        setMinInterval(newInterval)
        updateHistoryDates(secCode, newInterval)
    }

    const onSecurityTypeChanged = (type: SecurityType) => {
        getCurrentDeposit(type)
            .then(setRealDeposit)

        const newSecCodes: PrimeDropdownItem<string>[] = [{label: "ALL", value: null}]
        if (type) {
            const securities: Security[] = getSecuritiesByTypeAndMarket(market, type)
            for (const sec of securities) {
                newSecCodes.push({label: sec.secCode, value: sec.secCode})
            }
        } else {
            setSecCode(null)
        }
        setSecurityType(type)
        setSecCodes(newSecCodes)
        setSecCode(null)
    }

    const onSecCodeChanged = (newSecCode: string) => {
        setSecCode(newSecCode)
        const secId = getSecuritiesByTypeAndMarket(market, securityType)
            .find(value => value.secCode === newSecCode).id
        setSecId(secId)
        updateHistoryDates(newSecCode, minInterval)
    }

    const onStrategyChanged = (newStrategy: TradingStrategyName) => {
        console.log(newStrategy)
        setStrategy(newStrategy)
    }

    const updateHistoryDates = (newSecCode: string, minInterval: Interval) => {
        getSecurityHistoryDates(securityType, newSecCode)
            .then(value => {
                const dto: HistoryDateDto = value.historyDates.find(value => value.interval === minInterval)
                const min = moment(dto.start).toDate()
                const max = moment(dto.end).toDate()
                setMinStartDate(min)
                setMaxEndDate(max)
                setStart(min)
                setEnd(max)
            })
    }

    const onDepositSetupChanged = (newSetup: DepositSetup): void => {
        setDepositSetup(Object.assign({}, newSetup))
    }

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
                            <Dropdown optionLabel="id"
                                      value={broker}
                                      options={brokers}
                                      onChange={(e) => {
                                          const broker: Broker = e.value
                                          setBroker(broker)
                                          setPlatforms([broker.tradingPlatform].map(val => ({label: val, value: val})))
                                          setPlatform(broker.tradingPlatform)
                                          if (BrokerId.ALFA_DIRECT === broker.id) {
                                              setMarkets([Market.MOEX].map(val => ({label: val, value: val})))
                                              setMarket(Market.MOEX)
                                          } else if (BrokerId.TINKOFF_INVEST === broker.id) {
                                              setMarkets([Market.SPB].map(val => ({label: val, value: val})))
                                              setMarket(Market.SPB)
                                          }
                                      }}
                                      placeholder="Select a broker"
                                      style={{width: '150px'}}/>
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
                            <div style={{fontSize: "10px"}}>Market</div>
                            <Dropdown value={market}
                                      options={markets}
                                      onChange={(e) => {
                                          setMarket(e.value)
                                      }}
                                      placeholder="Select a market"
                                      style={{width: '80px'}}/>
                        </div>
                        <div className="p-col-1">
                            <div style={{fontSize: "10px"}}>Security type</div>
                            <Dropdown value={securityType}
                                      options={securityTypes}
                                      onChange={(e) => {
                                          onSecurityTypeChanged(e.value);
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
}
