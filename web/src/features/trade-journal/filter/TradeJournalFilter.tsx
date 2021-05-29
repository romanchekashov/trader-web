import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Toolbar } from "primereact/toolbar";
import * as React from "react";
import { useEffect, useState } from "react";
import strategiesApi from "../../../app/strategies/strategiesApi";
import { MarketSecuritiesDto } from "../../../common/data/bot/MarketSecuritiesDto";
import { Security } from "../../../common/data/security/Security";
import { SecurityInfo } from "../../../common/data/security/SecurityInfo";
import "./TradeJournalFilter.css";
import { TradeJournalFilterDto } from "./TradeJournalFilterDto";
import moment = require("moment");

export interface TradeJournalFilterState {
  market: MarketSecuritiesDto;
  security: PrimeDropdownItem<SecurityInfo>;
  start: Date;
  end: Date;
}

type Props = {
  onFilter: (data: TradeJournalFilterDto) => void;
};

interface PrimeDropdownItem<T> {
  label: string;
  value: T;
}

export const TradeJournalFilter: React.FC<Props> = ({ onFilter }) => {
  let initState: TradeJournalFilterState = {
    market: null,
    security: null,
    start: moment().hours(19).minutes(0).seconds(0).toDate(),
    end: moment().hours(19).minutes(0).seconds(0).toDate(),
  };

  const [market, setMarket] = useState<MarketSecuritiesDto>(initState.market);
  const [markets, setMarkets] = useState<MarketSecuritiesDto[]>([]);
  const [securities, setSecurities] = useState<PrimeDropdownItem<Security>[]>(
    []
  );
  const [security, setSecurity] = useState<Security>(null);
  const [start, setStart] = useState(initState.start);
  const [end, setEnd] = useState(initState.end);

  useEffect(() => {
    strategiesApi.getFilterData(false).then((marketBotFilterDataDto) => {
      setMarkets(marketBotFilterDataDto.marketSecurities);
      const marketSec = marketBotFilterDataDto.marketSecurities[0];
      setMarket(marketSec);
      onMarketChange(marketSec);
    });
  }, []);

  const onFilterClicked = () => {
    onFilter({
      securityType: market.securityType,
      secId: security?.id,
      start: start,
      end: end,
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
    const securities: PrimeDropdownItem<Security>[] = [
      { label: "ALL", value: null },
      ...val.securityHistoryDates.map(
        (securityHistoryDate): PrimeDropdownItem<Security> => ({
          label: `${securityHistoryDate.security.name}(${securityHistoryDate.security.code})`,
          value: securityHistoryDate.security,
        })
      ),
    ];
    setSecurities(securities);
  };

  const leftContents = (
    <>
      <Dropdown
        optionLabel="market"
        value={market}
        options={markets}
        onChange={(e) => onMarketChange(e.value)}
        placeholder="Select a market"
        style={{ width: "120px" }}
      />
      <Dropdown
        value={security}
        options={securities}
        onChange={(e) => {
          setSecurity(e.value);
        }}
        filter={true}
        filterPlaceholder="Sec. name"
        filterBy="label"
        placeholder="Select a security"
      />
      <div style={{ lineHeight: "22px", margin: "5px" }}>Start:</div>
      <Calendar
        value={start}
        onChange={(e) => setStart(e.value as any)}
        showTime={true}
        inputStyle={{ width: "130px" }}
      />
      <div style={{ lineHeight: "22px", margin: "5px" }}>End:</div>
      <Calendar
        value={end}
        onChange={(e) => setEnd(e.value as any)}
        showTime={true}
        inputStyle={{ width: "130px" }}
      />
    </>
  );

  const rightContents = (
    <>
      <Button
        label="Filter"
        icon="pi pi-caret-right"
        onClick={onFilterClicked}
        style={{ marginLeft: "10px" }}
      />
      <Button
        label="Clear"
        icon="pi pi-caret-right"
        className="p-button-secondary"
        onClick={onClearClicked}
        style={{ marginLeft: "10px" }}
      />
    </>
  );

  return (
    <Toolbar
      className="trade-journal-filter"
      left={leftContents}
      right={rightContents}
    />
  );
};
