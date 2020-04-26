import * as React from "react";
import {useEffect, useState} from "react";
import {Button} from "primereact/button";
import "./TradeJournalFilter.css";
import {Calendar} from "primereact/calendar";
import {TradeJournalFilterDto} from "./TradeJournalFilterDto";
import {ClassCode} from "../../../data/ClassCode";
import {Dropdown} from "primereact/dropdown";
import {getFilterData} from "../../../api/bot-control/tradeStrategyBotControlApi";
import {MarketSecuritiesDto} from "../../../api/dto/MarketBotFilterDataDto";
import {SecurityInfo} from "../../../api/dto/SecurityInfo";
import moment = require("moment");

export interface TradeJournalFilterState {
    market: MarketSecuritiesDto
    security: PrimeDropdownItem<SecurityInfo>
    start: Date
    end: Date
}

type Props = {
    onFilter: (data: TradeJournalFilterDto) => void
};

interface PrimeDropdownItem<T> {
    label: string
    value: T
}

export const TradeJournalFilter: React.FC<Props> = ({onFilter}) => {
    let initState: TradeJournalFilterState = {
        market: null,
        security: null,
        start: moment().hours(19).minutes(0).seconds(0).toDate(),
        end: moment().hours(19).minutes(0).seconds(0).toDate()
    };

    const classCodes = [ClassCode.SPBFUT, ClassCode.TQBR, ClassCode.CETS];

    const [market, setMarket] = useState(initState.market);
    const [markets, setMarkets] = useState([]);
    const [securities, setSecurities] = useState([]);
    const [security, setSecurity] = useState(initState.security);
    const [start, setStart] = useState(initState.start);
    const [end, setEnd] = useState(initState.end);

    useEffect(() => {
        getFilterData()
            .then(marketBotFilterDataDto => {
                setMarkets(marketBotFilterDataDto.marketSecurities);
                const marketSec = marketBotFilterDataDto.marketSecurities[0];
                setMarket(marketSec);
                onMarketChange(marketSec);
            })
    }, []);

    const onFilterClicked = () => {
        onFilter({
            classCode: market.classCode,
            secCode: security["code"],
            start: start,
            end: end
        });
    };

    const onClearClicked = () => {
        setSecurity(null);
        setStart(null);
        setEnd(null);
    };

    const onMarketChange = (val: MarketSecuritiesDto) => {
        setMarket(val);
        setSecurity(null);
        setSecurities(val.securities.map((security): PrimeDropdownItem<SecurityInfo> => ({
            label: `${security.name}(${security.code})`,
            value: security
        })));
    };

    return (
        <div className="trade-journal-filter">
            <div className="p-toolbar-group-left">
                <Dropdown optionLabel="market" value={market} options={markets}
                          onChange={(e) => onMarketChange(e.value)} placeholder="Select a market"
                          style={{width: '120px'}}/>
                <Dropdown value={security} options={securities} onChange={(e) => {
                    setSecurity(e.value)
                }} filter={true} filterPlaceholder="Sec. name" filterBy="label" placeholder="Select a security"/>
                <div style={{lineHeight: '22px', margin: '5px'}}>Start:</div>
                <Calendar value={start} onChange={(e) => setStart(e.value as any)}
                          showTime={true} inputStyle={{width: "130px"}}/>
                <div style={{lineHeight: '22px', margin: '5px'}}>End:</div>
                <Calendar value={end} onChange={(e) => setEnd(e.value as any)}
                          showTime={true} inputStyle={{width: "130px"}}/>
            </div>
            <div className="p-toolbar-group-right" style={{display: "flex"}}>
                <Button label="Filter" icon="pi pi-caret-right"
                        onClick={onFilterClicked} style={{marginLeft: '10px'}}/>
                <Button label="Clear" icon="pi pi-caret-right" className="p-button-secondary"
                        onClick={onClearClicked} style={{marginLeft: '10px'}}/>
            </div>
        </div>
    )
};
