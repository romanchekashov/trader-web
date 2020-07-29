import * as React from "react";
import {useEffect, useState} from "react";
import {Toolbar} from 'primereact/toolbar';
import {Button} from "primereact/button";
import {Dropdown} from "primereact/dropdown";
import {Checkbox} from "primereact/checkbox";
import {Broker} from "../../../common/data/Broker";
import {MarketBotFilterDataDto} from "../../../common/data/bot/MarketBotFilterDataDto";
import {TradingPlatform} from "../../../common/data/trading/TradingPlatform";
import {SecurityInfo} from "../../../common/data/SecurityInfo";
import {Interval} from "../../../common/data/Interval";
import {MarketBotStartDto} from "../../../common/data/bot/MarketBotStartDto";
import "./Filter.css";
import {Intervals} from "../../../common/utils/utils";
import {MarketSecuritiesDto} from "../../../common/data/bot/MarketSecuritiesDto";
import {TradingStrategyName} from "../../../common/data/trading/TradingStrategyName";
import {TradeSystemType} from "../../../common/data/trading/TradeSystemType";

export interface FilterState {
    broker: Broker
    platform: TradingPlatform
    market: MarketSecuritiesDto
    security: PrimeDropdownItem<SecurityInfo>
    realDepo: boolean
    highTimeFrame: Interval
    tradingTimeFrame: Interval
    lowTimeFrame: Interval
    systemType: TradeSystemType
}

type Props = {
    filter: MarketBotFilterDataDto;
    onStart: (data: MarketBotStartDto) => void
};

interface PrimeDropdownItem<T> {
    label: string
    value: T
}

const Filter: React.FC<Props> = ({filter, onStart}) => {
    let initState: FilterState = {
        broker: filter ? filter.broker : null,
        platform: filter ? filter.broker.tradingPlatform : null,
        market: filter ? filter.marketSecurities[0] : null,
        security: null,
        realDepo: false,
        highTimeFrame: Interval.M30,
        tradingTimeFrame: Interval.M3,
        lowTimeFrame: Interval.M1,
        systemType: TradeSystemType.HISTORY
    };

    const brokers = filter ? [filter.broker] : [];
    const [broker, setBroker] = useState(initState.broker);

    const platforms = filter ? [filter.broker.tradingPlatform].map(val => ({label: val, value: val})) : [];
    const [platform, setPlatform] = useState(initState.platform);

    const markets = filter ? filter.marketSecurities : [];
    const [market, setMarket] = useState(initState.market);

    const [securities, setSecurities] = useState([]);

    const [security, setSecurity] = useState(initState.security);

    const intervals: PrimeDropdownItem<Interval>[] = Intervals.map(val => ({label: val, value: val}));
    const [highTimeFrame, setHighTimeFrame] = useState(initState.highTimeFrame);
    const [tradingTimeFrame, setTradingTimeFrame] = useState(initState.tradingTimeFrame);
    const [lowTimeFrame, setLowTimeFrame] = useState(initState.lowTimeFrame);

    const [realDepo, setRealDepo] = useState(initState.realDepo);

    const systemTypes: PrimeDropdownItem<TradeSystemType>[] = [TradeSystemType.HISTORY,
        TradeSystemType.DEMO, TradeSystemType.REAL].map(val => ({label: val, value: val}));
    const [systemType, setSystemType] = useState(initState.systemType);

    const onMarketChange = (val: MarketSecuritiesDto) => {
        setMarket(val);
        setSecurity(null);
        setSecurities(val.securityHistoryDates
            .map((securityHistoryDate): PrimeDropdownItem<SecurityInfo> => ({
                    label: `${securityHistoryDate.security.name}(${securityHistoryDate.security.code})`,
                    value: securityHistoryDate.security
                })
            )
        );
    };

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
            classCode: market.classCode,
            secCode: security ? security["code"] : null,
            timeFrameTrading: tradingTimeFrame,
            timeFrameMin: lowTimeFrame,

            depositSetup: null,
            systemType,
            start: null,
            end: null,
            strategy: TradingStrategyName.TWO_EMA_CROSS
        });
    };

    return (
        <Toolbar className="filter">
            <div className="p-toolbar-group-left">
                <Dropdown optionLabel="name" value={broker} options={brokers} onChange={(e) => {
                    setBroker(e.value)
                }} placeholder="Select a broker"/>
                <Dropdown value={platform} options={platforms} onChange={(e) => {
                    setPlatform(e.value)
                }} placeholder="Select a platform"/>
                <Dropdown optionLabel="market"
                          value={market}
                          options={markets}
                          onChange={(e) => onMarketChange(e.value)}
                          placeholder="Select a market"/>
                <Dropdown value={security} options={securities} onChange={(e) => {
                    setSecurity(e.value)
                }} filter={true} filterPlaceholder="Sec. name" filterBy="label" placeholder="Select a security"/>
                <Dropdown value={highTimeFrame} options={intervals} onChange={(e) => {
                    setHighTimeFrame(e.value)
                }}/>
                <Dropdown value={tradingTimeFrame} options={intervals} onChange={(e) => {
                    setTradingTimeFrame(e.value)
                }}/>
                <Dropdown value={lowTimeFrame} options={intervals} onChange={(e) => {
                    setLowTimeFrame(e.value)
                }}/>
            </div>
            <div className="p-toolbar-group-right">
                <Checkbox inputId="cb1" onChange={e => setRealDepo(e.checked)} checked={realDepo}/>
                <label htmlFor="cb1" className="p-checkbox-label" style={{marginRight: '1em'}}>Real Deposit</label>
                <Button label="Analyze" icon="pi pi-caret-right" onClick={onStartClicked}/>
            </div>
        </Toolbar>
    )
};

export default Filter;