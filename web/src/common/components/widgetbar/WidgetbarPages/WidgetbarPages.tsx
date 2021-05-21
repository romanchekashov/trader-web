import * as React from "react";
import { useEffect, useState } from "react";
import DepositView from "../../../../app/deposits/components/DepositView/DepositView";
import { useAppDispatch } from "../../../../app/hooks";
import { setPossibleTrade } from "../../../../app/possibleTrades/possibleTradesSlice";
import Securities from "../../../../app/securities/components/Securities";
import { setSecurityById } from "../../../../app/securities/securitiesSlice";
import MoexOpenInterestView from "../../../../features/analysis/analysis/moex-open-interest/MoexOpenInterestView";
import { SupplyAndDemand } from "../../../../features/analysis/analysis/supply-and-demand/SupplyAndDemand";
import { SecurityLastInfoView } from "../../../../features/trading-charts/security/info/SecurityLastInfoView";
import { BrokerId } from "../../../data/BrokerId";
import { ClassCode } from "../../../data/ClassCode";
import { DataType } from "../../../data/DataType";
import { FilterDto } from "../../../data/FilterDto";
import { Market } from "../../../data/Market";
import { SecurityLastInfo } from "../../../data/security/SecurityLastInfo";
import { TradingPlatform } from "../../../data/trading/TradingPlatform";
import Alerts from "../../alerts/Alerts";
import ActiveTradesView from "../../control-panel/components/ActiveTradesView";
import ControlPanelWidget from "../../control-panel/ControlPanelWidget/ControlPanelWidget";
import EconomicCalendarWidget from "../../economic-calendar/EconomicCalendarWidget/EconomicCalendarWidget";
import { News } from "../../news/News";
import Notifications from "../../notifications/Notifications";
import { StockEventsBrief } from "../../share-event/StockEventsBrief";
import { Stack } from "../../stack/Stack";
import { WidgetbarItem } from "../WidgetbarItem";
import "./WidgetbarPages.css";

type Props = {
  item: WidgetbarItem | undefined;
  security: SecurityLastInfo | undefined;
};

const WidgetbarPages: React.FC<Props> = ({ item, security }) => {
  const dispatch = useAppDispatch();
  const [filterDto, setFilterDto] = useState<FilterDto>(null);
  const [filterAlarms, setFilterAlarms] = useState<FilterDto>(null);

  const [height, setHeight] = useState<number>(800);

  useEffect(() => {
    updateSize();
    window.addEventListener("resize", updateSize);

    setFilterDto({
      brokerId: BrokerId.ALFA_DIRECT,
      tradingPlatform: TradingPlatform.QUIK,
      secId: null,
      fetchByWS: true,
      history: false,
      all: true,
    });

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  useEffect(() => {
    setFilterAlarms({
      brokerId:
        security?.market === Market.SPB
          ? BrokerId.TINKOFF_INVEST
          : BrokerId.ALFA_DIRECT,
      tradingPlatform:
        security?.market === Market.SPB
          ? TradingPlatform.API
          : TradingPlatform.QUIK,
      secId: security?.id,
      fetchByWS: true,
      history: false,
      all: false,
    });
  }, [security?.id]);

  const updateSize = () => {
    setHeight(window.innerHeight - 10);
  };

  return (
    <div className="WidgetbarPages">
      {item === WidgetbarItem.SECURITIES ? (
        <>
          <ActiveTradesView />
          <DepositView />
          <Securities />
          <SecurityLastInfoView />
        </>
      ) : null}

      {security && item === WidgetbarItem.SEC_DATA ? (
        <>
          <SecurityLastInfoView />
          <SupplyAndDemand />
          <MoexOpenInterestView security={security} />
        </>
      ) : null}

      {item === WidgetbarItem.NEWS ? (
        <>
          {ClassCode.TQBR === security?.classCode ? (
            <>
              <StockEventsBrief
                secCode={security?.secCode}
                height={height / 2}
              />
              <News secId={security?.id} height={height / 2} />
            </>
          ) : (
            <News secId={security?.id} height={height} />
          )}
        </>
      ) : null}

      {item === WidgetbarItem.CALENDAR ? (
        <EconomicCalendarWidget
          secId={security?.id}
          onEventSelected={console.log}
          viewHeight={height}
        />
      ) : null}

      {item === WidgetbarItem.NOTIFICATIONS ? (
        <Notifications
          filter={filterDto}
          security={security}
          onNotificationSelected={(n) => {
            dispatch(setSecurityById(n.secId));
            if (n.dataType === DataType.POSSIBLE_TRADE) {
              dispatch(setPossibleTrade(n.data));
            }
            console.log(n);
          }}
          viewHeight={height}
          itemSize={120}
        />
      ) : null}

      {item === WidgetbarItem.ALARMS ? (
        <Alerts
          filter={filterAlarms}
          security={security}
          onAlertSelected={(n) => {
            console.log(n);
          }}
          alertsHeight={height}
        />
      ) : null}

      {item === WidgetbarItem.CONTROL_PANEL ? <ControlPanelWidget /> : null}

      {security && item === WidgetbarItem.LEVEL_2_QUOTES ? <Stack /> : null}
    </div>
  );
};

export default WidgetbarPages;
