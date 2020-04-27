import * as React from "react";
import {useEffect, useState} from "react";
import {Toolbar} from 'primereact/toolbar';
import {Button} from "primereact/button";
import {Dropdown} from "primereact/dropdown";
import {Checkbox} from "primereact/checkbox";
import {Broker} from "../../../api/dto/Broker";
import {MarketBotFilterDataDto, MarketSecuritiesDto} from "../../../api/dto/MarketBotFilterDataDto";
import {TradingPlatform} from "../../../api/dto/TradingPlatform";
import {SecurityInfo} from "../../../api/dto/SecurityInfo";
import {Interval} from "../../../data/Interval";
import {MarketBotStartDto} from "../../../api/dto/MarketBotStartDto";
import "./Filter.css";

export interface FilterState {
    broker: Broker
    platform: TradingPlatform
    market: MarketSecuritiesDto
    security: PrimeDropdownItem<SecurityInfo>
    realDepo: boolean
    highTimeFrame: Interval
    tradingTimeFrame: Interval
    lowTimeFrame: Interval
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
        tradingTimeFrame: Interval.M5,
        lowTimeFrame: Interval.M1
    };

    const brokers = filter ? [filter.broker] : [];
    const [broker, setBroker] = useState(initState.broker);

    const platforms = filter ? [filter.broker.tradingPlatform].map(val => ({ label: val, value: val })) : [];
    const [platform, setPlatform] = useState(initState.platform);

    const markets = filter ? filter.marketSecurities : [];
    const [market, setMarket] = useState(initState.market);

    const [securities, setSecurities] = useState([]);

    const [security, setSecurity] = useState(initState.security);

    const intervals: PrimeDropdownItem<Interval>[] = [Interval.M1, Interval.M2, Interval.M3, Interval.M5, Interval.M10,
        Interval.M15, Interval.M30, Interval.M60, Interval.H2, Interval.H4, Interval.DAY, Interval.WEEK, Interval.MONTH]
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
            secCode: security ? security["code"]: null,
            realDeposit: realDepo,
            timeFrameHigh: highTimeFrame,
            timeFrameTrading: tradingTimeFrame,
            timeFrameLow: lowTimeFrame
        });
    };

    return (
        <Toolbar className="filter">
            <div className="p-toolbar-group-left">
                <Dropdown optionLabel="name" value={broker} options={brokers} onChange={(e) => {setBroker(e.value)}} placeholder="Select a broker"/>
                <Dropdown value={platform} options={platforms} onChange={(e) => {setPlatform(e.value)}} placeholder="Select a platform"/>
                <Dropdown optionLabel="market" value={market} options={markets} onChange={(e) => onMarketChange(e.value)} placeholder="Select a market"/>
                <Dropdown value={security} options={securities} onChange={(e) => {setSecurity(e.value)}} filter={true} filterPlaceholder="Sec. name" filterBy="label" placeholder="Select a security"/>
                <Dropdown value={highTimeFrame} options={intervals} onChange={(e) => {setHighTimeFrame(e.value)}}/>
                <Dropdown value={tradingTimeFrame} options={intervals} onChange={(e) => {setTradingTimeFrame(e.value)}}/>
                <Dropdown value={lowTimeFrame} options={intervals} onChange={(e) => {setLowTimeFrame(e.value)}}/>
            </div>
            <div className="p-toolbar-group-right">
                <Checkbox inputId="cb1" onChange={e => setRealDepo(e.checked)} checked={realDepo} />
                <label htmlFor="cb1" className="p-checkbox-label" style={{marginRight: '1em'}}>Real Deposit</label>
                <Button label="Analyze" icon="pi pi-caret-right" onClick={onStartClicked}/>
            </div>
        </Toolbar>
    )
};

export default Filter;