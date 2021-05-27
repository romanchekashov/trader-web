import * as React from "react";
import { useEffect, useState } from "react";
import { SecurityLastInfo } from "../../common/data/security/SecurityLastInfo";
import { Interval } from "../../common/data/Interval";
import { WebsocketService, WSEvent } from "../../common/api/WebsocketService";
import { filterSecurities } from "../../common/utils/DataUtils";
import { TradingPlatform } from "../../common/data/trading/TradingPlatform";
import { TradeStrategyAnalysisFilterDto } from "../../common/data/TradeStrategyAnalysisFilterDto";
import { Market } from "../../common/data/Market";
import { BrokerId } from "../../common/data/BrokerId";
import { PrimeDropdownItem } from "../../common/utils/utils";
import { Paginator } from "primereact/paginator";
import { Dropdown } from "primereact/dropdown";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectSecurities } from "../../app/securities/securitiesSlice";
import ChartWrapperContainer from "../../common/components/chart/ChartWrapperContainer/ChartWrapperContainer";
import { SecurityType } from "../../common/data/security/SecurityType";
import { SecurityTypeWrapper } from "../../common/data/security/SecurityTypeWrapper";

const intervals: PrimeDropdownItem<Interval>[] = [
  Interval.M1,
  Interval.M3,
  Interval.M5,
  Interval.M15,
  Interval.M30,
  Interval.M60,
  Interval.H2,
  Interval.DAY,
  Interval.WEEK,
  Interval.MONTH,
].map((val) => ({ label: val, value: val }));
const chartsNumbers: PrimeDropdownItem<number>[] = [4, 8].map((val) => ({ label: "" + val, value: val }));

export const TradingChartsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { securities, security, selectedSecurityTypeWrapper } =
    useAppSelector(selectSecurities);

  const [page, setPage] = useState<number>(0);
  const [height, setHeight] = useState<number>(800);
  const [interval, setInterval] = useState<Interval>(Interval.M3);
  const [chartsNumber, setChartsNumber] = useState<number>(8);

  useEffect(() => {
    setTimeout(updateSize, 1000);
    window.addEventListener("resize", updateSize);

    // Specify how to clean up after this effect:
    return function cleanup() {
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  const updateSize = () => {
    setHeight(window.innerHeight - 20 - 37);
  };

  const informServerAboutRequiredData = (
    securityLastInfo: SecurityLastInfo
  ): void => {
    if (securityLastInfo) {
      WebsocketService.getInstance().send<TradeStrategyAnalysisFilterDto>(
        WSEvent.SUBSCRIBE_TRADE_PREMISE_AND_SETUP,
        {
          brokerId:
            securityLastInfo.market === Market.SPB
              ? BrokerId.TINKOFF_INVEST
              : BrokerId.ALFA_DIRECT,
          tradingPlatform:
            securityLastInfo.market === Market.SPB
              ? TradingPlatform.API
              : TradingPlatform.QUIK,
          secId: securityLastInfo.id,
          timeFrameTrading: securityLastInfo.type === SecurityType.FUTURE ? Interval.M3 : Interval.M60,
          timeFrameMin: securityLastInfo.type === SecurityType.FUTURE ? Interval.M1 : Interval.M5,
        }
      );
      WebsocketService.getInstance().send<string>(
        WSEvent.GET_TRADES_AND_ORDERS,
        securityLastInfo.secCode
      );
    }
  };

  useEffect(() => {
    setPage(0);
    setInterval(
      selectedSecurityTypeWrapper === SecurityTypeWrapper.FUTURE
        ? Interval.M3
        : Interval.M60
    );
  }, [selectedSecurityTypeWrapper]);

  useEffect(() => {
    setPage(0);
  }, [chartsNumber]);

  const secs = filterSecurities(securities, selectedSecurityTypeWrapper);

  const rightContent = (
    <>
      <Dropdown
        value={interval}
        options={intervals}
        onChange={(e) => {
          setInterval(e.value);
        }}
      />
      <Dropdown
        value={chartsNumber}
        options={chartsNumbers}
        onChange={(e) => {
          setChartsNumber(e.value);
        }}
      />
    </>
  );

  const pColNum = chartsNumber === 8 ? 3 : 6;

  return (
    <div className="p-grid sample-layout analysis">
      {/*<div className="p-col-12" style={{padding: 0}}>
                <Filter filter={filterData} onStart={onStart}/>
            </div>*/}
      <div className="p-col-12" style={{ padding: 0 }}>
        <Paginator
          first={page}
          rows={chartsNumber}
          totalRecords={secs.length}
          onPageChange={(e) => setPage(e.first)}
          style={{ padding: 0 }}
          rightContent={rightContent}
        ></Paginator>
      </div>
      {secs.slice(page, page + chartsNumber).map((sec) => {
        return (
          <div
            key={sec.id}
            className={`p-col-${pColNum} ${sec.id === security?.id ? "active" : ""}`}
            style={{ padding: 0 }}
          >
            <ChartWrapperContainer
              security={sec}
              height={height / 2}
              interval={interval}
            />
          </div>
        );
      })}
    </div>
  );
};
