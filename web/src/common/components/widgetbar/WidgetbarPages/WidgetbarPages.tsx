import * as React from "react";
import { useEffect, useState } from "react";
import { useAppDispatch } from "../../../../app/hooks";
import { setPossibleTrade } from "../../../../app/possibleTrades/possibleTradesSlice";
import { setSecurityById } from "../../../../app/securities/securitiesSlice";
import { SecurityLastInfoView } from "../../../../features/trading-charts/security/info/SecurityLastInfoView";
import { BrokerId } from "../../../data/BrokerId";
import { DataType } from "../../../data/DataType";
import { FilterDto } from "../../../data/FilterDto";
import { SecurityLastInfo } from "../../../data/security/SecurityLastInfo";
import { TradingPlatform } from "../../../data/trading/TradingPlatform";
import ControlPanelWidget from "../../control-panel/ControlPanelWidget/ControlPanelWidget";
import Notifications from "../../notifications/Notifications";
import { StockEventsBrief } from "../../share-event/StockEventsBrief";
import { WidgetbarItem } from "../WidgetbarItem";
import "./WidgetbarPages.css";

type Props = {
  item: WidgetbarItem | undefined;
  security: SecurityLastInfo | undefined;
};

const WidgetbarPages: React.FC<Props> = ({ item, security }) => {
  const dispatch = useAppDispatch();
  const [filterDto, setFilterDto] = useState<FilterDto>(null);

  useEffect(() => {
    setFilterDto({
      brokerId: BrokerId.ALFA_DIRECT,
      tradingPlatform: TradingPlatform.QUIK,
      secId: null,
      fetchByWS: false,
      history: false,
      all: true,
    });
  }, []);

  return (
    <div className="WidgetbarPages">
      <div>{item}</div>
      {security && item === WidgetbarItem.NEWS ? (
        <StockEventsBrief secCode={security.secCode} height={600} />
      ) : null}
      {security && item === WidgetbarItem.SEC_DATA ? (
        <SecurityLastInfoView security={security} />
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
          viewHeight={600}
          itemSize={120}
        />
      ) : null}
      {item === WidgetbarItem.CONTROL_PANEL ? <ControlPanelWidget /> : null}
    </div>
  );
};

export default WidgetbarPages;
