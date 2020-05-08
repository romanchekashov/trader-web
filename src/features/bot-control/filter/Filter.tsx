import * as React from "react";
import {useEffect, useState} from "react";
import {Toolbar} from 'primereact/toolbar';
import {Button} from "primereact/button";
import {Dropdown} from "primereact/dropdown";
import {MarketBotFilterDataDto, MarketSecuritiesDto} from "../../../common/data/bot/MarketBotFilterDataDto";
import {Broker} from "../../../common/data/Broker";
import {TradingPlatform} from "../../../common/data/TradingPlatform";
import {SecurityInfo} from "../../../common/data/SecurityInfo";
import {Interval} from "../../../common/data/Interval";
import "./Filter.css";
import {Checkbox} from "primereact/checkbox";
import {MarketBotStartDto} from "../../../common/data/bot/MarketBotStartDto";
import {ToggleButton} from "primereact/togglebutton";
import FilterHistory from "./FilterHistory";

export interface FilterState {
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

interface PrimeDropdownItem<T> {
    label: string
    value: T
}

const Filter: React.FC<Props> = ({filter, onStart, onStopHistory}) => {
    let initState: FilterState = {
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

    const platforms = filter ? [filter.broker.tradingPlatform].map(val => ({ label: val, value: val })) : [];
    const [platform, setPlatform] = useState(initState.platform);

    const markets = filter ? filter.marketSecurities : [];
    const [market, setMarket] = useState(initState.market);

    const [securities, setSecurities] = useState([]);

    const [security, setSecurity] = useState(initState.security);

    const intervals: PrimeDropdownItem<Interval>[] = [Interval.M1, Interval.M3, Interval.M5, Interval.M30, Interval.DAY]
        .map(val => ({ label: val, value: val }));
    const [highTimeFrame, setHighTimeFrame] = useState(initState.highTimeFrame);
    const [tradingTimeFrame, setTradingTimeFrame] = useState(initState.tradingTimeFrame);
    const [lowTimeFrame, setLowTimeFrame] = useState(initState.lowTimeFrame);

    const [realDepo, setRealDepo] = useState(initState.realDepo);

    const onMarketChange = (val: MarketSecuritiesDto) => {
        setMarket(val);
        setSecurity(null);
        setSecurities(val.securities.map((security): PrimeDropdownItem<SecurityInfo> => ({label: `${security.name}(${security.code})`, value: security})));
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
            secCode: security["code"],
            realDeposit: realDepo,
            timeFrameHigh: highTimeFrame,
            timeFrameTrading: tradingTimeFrame,
            timeFrameLow: lowTimeFrame,
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
            classCode: market.classCode,
            secCode: security["code"],
            realDeposit: realDepo,
            timeFrameHigh: highTimeFrame,
            timeFrameTrading: tradingTimeFrame,
            timeFrameLow: lowTimeFrame,
            history: history,
            start: history ? start : null,
            end: history ? end : null
        });
    };

    return (
        <div className="filter">
            <div className="p-toolbar-group-left">
                <Dropdown optionLabel="name" value={broker} options={brokers} onChange={(e) => {setBroker(e.value)}} placeholder="Select a broker" style={{width: '130px'}}/>
                <Dropdown value={platform} options={platforms} onChange={(e) => {setPlatform(e.value)}} placeholder="Select a platform" style={{width: '80px'}}/>
                <Dropdown optionLabel="market" value={market} options={markets} onChange={(e) => onMarketChange(e.value)} placeholder="Select a market" style={{width: '120px'}}/>
                <Dropdown value={security} options={securities} onChange={(e) => {setSecurity(e.value)}} filter={true} filterPlaceholder="Sec. name" filterBy="label" placeholder="Select a security"/>
                <Dropdown value={highTimeFrame} options={intervals} onChange={(e) => {setHighTimeFrame(e.value)}} style={{width: '80px'}}/>
                <Dropdown value={tradingTimeFrame} options={intervals} onChange={(e) => {setTradingTimeFrame(e.value)}} style={{width: '80px'}}/>
                <Dropdown value={lowTimeFrame} options={intervals} onChange={(e) => {setLowTimeFrame(e.value)}} style={{width: '80px'}}/>
            </div>
            <div className="p-toolbar-group-right" style={{display: "flex"}}>
                <FilterHistory onEnabled={onHistory} onStartDate={setStart} onEndDate={setEnd} onDebug={setDebug} onStop={onStopHistoryClicked}/>
                {history ? null : <ToggleButton checked={realDepo} onChange={(e) => setRealDepo(e.value)} onLabel="Real Depo" offLabel="Real Depo" style={{marginLeft: '10px'}} />}
                <Button label="Start" icon="pi pi-caret-right" className="p-button-warning" onClick={onStartClicked} style={{marginLeft: '10px'}}/>
            </div>
        </div>
    )
};

export default Filter;