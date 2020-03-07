import * as React from "react";
import {useState} from "react";
import {Toolbar} from 'primereact/toolbar';
import {Button} from "primereact/button";
import {Dropdown} from "primereact/dropdown";
import {MarketBotFilterDataDto} from "./dto/MarketBotFilterDataDto";
import {Broker} from "./dto/Broker";
import {TradingPlatform} from "./dto/TradingPlatform";
import {SecurityInfo} from "./dto/SecurityInfo";
import {Interval} from "./dto/Interval";

export interface FilterState {
    broker: Broker
    platform: TradingPlatform
    market: string
    security: SecurityInfo
    realDepo: boolean
    highTimeFrame: Interval
    tradingTimeFrame: Interval
    lowTimeFrame: Interval
}

type Props = {
    filter: MarketBotFilterDataDto;
};

const getKeys = (map: any): any[] => {
    const keys = []
    for (let key in map) {
        if (map.hasOwnProperty(key)) {
            keys.push(key)
        }
    }
    return keys
};

interface PrimeDropdownItem {
    label: string
    value: any
}

const Filter: React.FC<Props> = ({filter}) => {
    const marketSymbolsKeys = filter ? getKeys(filter.marketSymbols) : [];

    let initState: FilterState = {
        broker: filter ? filter.broker : null,
        platform: filter ? filter.broker.tradingPlatform : null,
        market: filter ? marketSymbolsKeys[0] : null,
        security: null,
        realDepo: false,
        highTimeFrame: Interval.M30,
        tradingTimeFrame: Interval.M3,
        lowTimeFrame: Interval.M1
    };

    const brokers = filter ? [filter.broker] : [];
    const [broker, setBroker] = useState(initState.broker);

    const platformDropdownItem: PrimeDropdownItem = filter ? { label: initState.platform, value: initState.platform } : null;
    const platforms = filter ? [platformDropdownItem] : [];
    const [platform, setPlatform] = useState(initState.platform);

    const markets = filter ? marketSymbolsKeys.map(key => ({ label: key, value: key })) : [];
    const [market, setMarket] = useState(initState.market);

    return (
        <Toolbar>
            <div className="p-toolbar-group-left">
                <Dropdown optionLabel="name" value={broker} options={brokers} onChange={(e) => {setBroker(e.value)}} placeholder="Select a broker"/>
                <Dropdown value={platform} options={platforms} onChange={(e) => {setPlatform(e.value)}} placeholder="Select a platform"/>
                <Dropdown value={market} options={markets} onChange={(e) => {setMarket(e.value)}} placeholder="Select a market"/>
                <Button label="New" icon="pi pi-plus" style={{marginRight: '.25em'}}/>
                <Button label="Upload" icon="pi pi-upload" className="p-button-success"/>
                <i className="pi pi-bars p-toolbar-separator" style={{marginRight: '.25em'}}/>
                <Button label="Save" icon="pi pi-check" className="p-button-warning"/>
            </div>
            <div className="p-toolbar-group-right">
                <Button icon="pi pi-search" style={{marginRight: '.25em'}}/>
                <Button icon="pi pi-calendar" className="p-button-success" style={{marginRight: '.25em'}}/>
                <Button icon="pi pi-times" className="p-button-danger"/>
            </div>
        </Toolbar>
    )
};

export default Filter;